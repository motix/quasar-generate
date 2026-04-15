import type { CollectionReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import regenerateCode from 'utils/regenerateCode.js';

import type {
  CustomerAm as Customer,
  InvoiceAm as Invoice,
  SalesContractAm as SalesContract,
} from 'models/finance/index.js';

export const customersUpdater = onDocumentWritten('finance_customers/{id}', async (event) => {
  if (!event.data?.before.exists) {
    return;
  }

  const customerChange = event.data as Change<DocumentSnapshot<Customer>>;
  const id = customerChange.before.id;

  const db = getFirestore();

  // Update Invoice.customer, Invoice.code
  // Update Transaction.code

  if (
    customerChange.after.data()?.code !== customerChange.before.data()!.code ||
    customerChange.after.data()?.name !== customerChange.before.data()!.name
  ) {
    // Project invoices are updated via production-projectsAdapter

    // General invoices

    const invoicesRef = db.collection('finance_generalInvoices') as CollectionReference<Invoice>;
    const invoicesSnapshot = await invoicesRef.where('customer.id', '==', id).get();

    info(
      '[finance-customersUpdater]',
      `Found ${invoicesSnapshot.size} general invoices for customer "${customerChange.before.data()!.name}".`,
    );

    for (const snapshot of invoicesSnapshot.docs) {
      const invoice = snapshot.data();

      info(
        '[finance-customersUpdater]',
        `Updating general invoice "${invoice.code}" (${invoice.content})...`,
      );

      if (customerChange.after.exists) {
        invoice.customer.name = customerChange.after.data()!.name;

        if (customerChange.after.data()?.code !== customerChange.before.data()!.code) {
          invoice.customer.code = customerChange.after.data()!.code;

          invoice.code = await regenerateCode(
            invoice.code,
            customerChange.after.data()!.code.toUpperCase(),
          );

          for (const transaction of invoice.transactions) {
            transaction.code = await regenerateCode(
              transaction.code,
              customerChange.after.data()!.code.toUpperCase(),
            );
          }
        }
      } else {
        invoice.customer.name += ' * DELETED *';
      }

      await snapshot.ref.set({ customer: invoice.customer, code: invoice.code }, { merge: true });
    }

    if (customerChange.after.exists) {
      info(
        '[finance-customersUpdater]',
        `Updated ${invoicesSnapshot.size} general invoices for customer "${customerChange.after.data()!.name}".`,
      );
    } else {
      info(
        '[finance-customersUpdater]',
        `Updated ${invoicesSnapshot.size} general invoices for DELETED customer "${customerChange.before.data()!.name}".`,
      );
    }

    // Sale contracts

    const contractsRef = db.collection(
      'finance_salesContracts',
    ) as CollectionReference<SalesContract>;
    const contractsSnapshot = await contractsRef.where('customer.id', '==', id).get();

    info(
      '[finance-customersUpdater]',
      `Found ${contractsSnapshot.size} sales contracts for customer "${customerChange.before.data()!.name}".`,
    );

    for (const snapshot of contractsSnapshot.docs) {
      const contract = snapshot.data();

      info(
        '[finance-customersUpdater]',
        `Updating sales contract "${contract.code}" (${contract.content})...`,
      );

      if (customerChange.after.exists) {
        contract.customer.name = customerChange.after.data()!.name;
        contract.customer.code = customerChange.after.data()!.code;
      } else {
        contract.customer.name += ' * DELETED *';
      }

      await snapshot.ref.set({ customer: contract.customer }, { merge: true });
    }

    if (customerChange.after.exists) {
      info(
        '[finance-customersUpdater]',
        `Updated ${contractsSnapshot.size} sales contracts for customer "${customerChange.after.data()!.name}".`,
      );
    } else {
      info(
        '[finance-customersUpdater]',
        `Updated ${contractsSnapshot.size} sales contracts for DELETED customer "${customerChange.before.data()!.name}".`,
      );
    }
  }
});
