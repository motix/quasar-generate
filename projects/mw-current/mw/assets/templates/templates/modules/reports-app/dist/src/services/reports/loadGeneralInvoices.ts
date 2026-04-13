import type { CollectionReference, QueryConstraint } from 'firebase/firestore';
import { collection, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';

import InvoiceStatus from 'utils/finance/Invoice/InvoiceStatus.js';
import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { Invoice, InvoiceAm } from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import { getFirestore } from 'services/firebase.js';

export default async function loadGeneralInvoices(
  startDate: Date,
  endDate: Date,
  ...queryConstraints: QueryConstraint[]
) {
  const db = getFirestore();
  const invoicesRef = collection(db, 'finance_generalInvoices') as CollectionReference<InvoiceAm>;
  const invoicesQuery = query(
    invoicesRef,
    where('issueDate', '>=', Timestamp.fromDate(startDate)),
    where('issueDate', '<=', Timestamp.fromDate(endDate)),
    where('isCompleted', '==', true),
    where('isCancelled', '==', false),
    orderBy('issueDate'),
    orderBy('createDate'),
    ...queryConstraints,
  );
  const invoicesSnapshot = await getDocs(invoicesQuery);
  const invoiceAndIds = invoicesSnapshot.docs.map((invoiceSnapshot) => [
    invoiceSnapshot.data(),
    invoiceSnapshot.id,
  ]);
  const invoiceAms = invoiceAndIds.map((invoiceAndId) => invoiceAndId[0] as InvoiceAm);
  const invoiceIdMap = new Map(invoiceAndIds as Iterable<readonly [InvoiceAm, string]>);
  const extraArgs = () => ({ idMap: invoiceIdMap });
  const invoices = financeMapper.mapArray<InvoiceAm, Invoice>(invoiceAms, 'InvoiceAm', 'Invoice', {
    extraArgs,
  });

  invoices.forEach((invoice) => {
    invoice.statusHelper = new InvoiceStatus(invoice, []);

    invoice.transactions.forEach((transaction) => {
      transaction.statusHelper = new TransactionStatus(transaction, []);
    });
  });

  return invoices;
}
