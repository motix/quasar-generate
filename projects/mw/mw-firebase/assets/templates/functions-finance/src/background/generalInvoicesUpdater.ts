import type { CollectionReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import clearReportsCache from 'utils/clearReportsCache.js';
import { collectionForeach } from 'utils/queryForeach.js';

import type {
  InvoiceAm as Invoice,
  SalesContractAm as SalesContract,
  TransactionAm as Transaction,
} from 'models/finance/index.js';

export const generalInvoicesUpdater = onDocumentWritten(
  'finance_generalInvoices/{id}',
  async (event) => {
    if (!event.data) {
      return;
    }

    const invoiceChange = event.data as Change<DocumentSnapshot<Invoice>>;
    const beforeOrAfterInvoice =
      invoiceChange.before.data() ||
      invoiceChange.after.data() ||
      (() => {
        throw new Error('Both before and after data do not exist.'); // There's no scenario where this happens.
      })();

    const transactionsMetaDataCollectionPath = `finance_generalInvoices/${invoiceChange.after.id}/transactionsMetaData`;

    info(
      '[finance-generalInvoicesUpdater]',
      `Deleting all transaction meta data for general invoice "${beforeOrAfterInvoice.code}" (${beforeOrAfterInvoice.content}) at "${transactionsMetaDataCollectionPath}"...`,
    );

    await collectionForeach(transactionsMetaDataCollectionPath, async (docSnapshot) => {
      await docSnapshot.ref.delete();
    });

    const db = getFirestore();

    if (!invoiceChange.after.exists) {
      // Clear Reports cache

      await clearReportsCache();

      // Update sales_contract

      const invoice = invoiceChange.before.data()!;

      const contractsRef = db.collection(
        'finance_salesContracts',
      ) as CollectionReference<SalesContract>;
      const contractsSnapshot = await contractsRef
        .where('generalInvoiceIds', 'array-contains', invoiceChange.before.id)
        .get();

      info(
        '[finance-generalInvoicesUpdater]',
        `Found ${contractsSnapshot.size} sales contracts for DELETED general invoice "${invoice.code}" (${invoice.content}).`,
      );

      for (const snapshot of contractsSnapshot.docs) {
        const contract = snapshot.data();

        info('[finance-generalInvoicesUpdater]', `Updating contract "${contract.code}"...`);

        await snapshot.ref.set(
          {
            generalInvoiceIds: contract.generalInvoiceIds.filter(
              (value) => value !== invoiceChange.before.id,
            ),
            notes: `${contract.notes?.startsWith('!') ? '' : '! '}${contract.notes}${contract.notes ? ' ' : ''}General invoice "${invoice.code}" (${invoice.content}) deleted.`,
          },
          { merge: true },
        );
      }

      info(
        '[finance-generalInvoicesUpdater]',
        `Updated ${contractsSnapshot.size} sales contracts for DELETED general invoice "${invoice.code}" (${invoice.content}).`,
      );

      return;
    }

    // Update finance_generalInvoices/{id}/transactionsMetaData

    const transactionsMetaDataRef = db.collection(
      transactionsMetaDataCollectionPath,
    ) as CollectionReference<{
      issueDate: Transaction['issueDate'];
      financeAccountIds: string[];
    }>;

    const invoice = invoiceChange.after.data()!;
    const metaDataRecords = [
      ...invoice.transactions.map((value) => ({
        issueDate: value.issueDate,
        customerId: invoice.customer.id,
        financeAccountIds: [
          ...(value.sourceFinanceAccount ? [value.sourceFinanceAccount.id] : []),
          ...(value.destinationFinanceAccount ? [value.destinationFinanceAccount.id] : []),
        ],
      })),
    ];

    info(
      '[finance-generalInvoicesUpdater]',
      `Adding ${metaDataRecords.length} transaction meta data records for general invoice "${invoice.code}" (${invoice.content}) at "${transactionsMetaDataCollectionPath}"...`,
    );

    for (const record of metaDataRecords) {
      await transactionsMetaDataRef.add(record);
    }

    // Clear Reports cache

    await clearReportsCache();
  },
);
