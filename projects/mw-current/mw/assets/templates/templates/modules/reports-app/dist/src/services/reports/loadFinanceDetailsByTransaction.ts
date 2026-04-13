import type { DocumentData, Query, QueryConstraint } from 'firebase/firestore';
import { collectionGroup, getDoc, getDocs, query, Timestamp, where } from 'firebase/firestore';

import { uniqBy } from 'lodash-es';

import ExpenseStatus from 'utils/finance/Expense/ExpenseStatus.js';
import InvoiceStatus from 'utils/finance/Invoice/InvoiceStatus.js';
import ProjectStatus_ProjectInvoices from 'utils/finance/Project/ProjectStatus_ProjectInvoices.js';
import QuotationStatus from 'utils/finance/Quotation/QuotationStatus.js';
import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type {
  Expense,
  ExpenseAm,
  Invoice,
  InvoiceAm,
  Project,
  ProjectAm,
  Transaction,
  TransactionAm,
} from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import { getFirestore } from 'services/firebase.js';

export default async function loadFinanceDetailsByTransaction(
  startDate: Date,
  endDate: Date,
  ...queryConstraints: QueryConstraint[]
) {
  const db = getFirestore();
  const transactionsMetaDataRef = collectionGroup(db, 'transactionsMetaData') as Query<{
    issueDate: Timestamp;
  }>;
  const transactionsMetaDataQuery = query(
    transactionsMetaDataRef,
    where('issueDate', '>=', Timestamp.fromDate(startDate)),
    where('issueDate', '<=', Timestamp.fromDate(endDate)),
    ...queryConstraints,
  );
  const transactionsMetaDataSnapshot = await getDocs(transactionsMetaDataQuery);
  const detailRefs = uniqBy(
    transactionsMetaDataSnapshot.docs.flatMap((transactionMetaData) =>
      transactionMetaData.ref.parent.parent ? [transactionMetaData.ref.parent.parent] : [],
    ),
    (detailRef) => detailRef.id,
  );
  const detailSnapshots = await Promise.all(detailRefs.map((detailRef) => getDoc(detailRef)));
  const detailAndIds = detailSnapshots.map((detailSnapshot) => [
    detailSnapshot.data(),
    detailSnapshot.id,
  ]);
  const idMap = new Map(
    detailAndIds as Iterable<readonly [ProjectAm | InvoiceAm | ExpenseAm | TransactionAm, string]>,
  );

  // Projects

  const projectAms = detailAndIds
    .filter((detailAndId) => (detailAndId[0] as DocumentData).name)
    .map((projectAndId) => projectAndId[0] as ProjectAm);
  const projectExtraArgs = () => ({ idMap });
  const projects = financeMapper.mapArray<ProjectAm, Project>(projectAms, 'ProjectAm', 'Project', {
    extraArgs: projectExtraArgs,
  });

  projects.forEach((project) => {
    project.statusHelper = new ProjectStatus_ProjectInvoices(project, []);

    project.quotations.forEach((quotation) => {
      quotation.statusHelper = new QuotationStatus(quotation, []);

      if (quotation.invoice) {
        quotation.invoice.statusHelper = new InvoiceStatus(quotation.invoice, []);

        quotation.invoice.transactions.forEach((transaction) => {
          transaction.statusHelper = new TransactionStatus(transaction, []);
        });
      }
    });

    project.expenses.forEach((expense) => {
      expense.statusHelper = new ExpenseStatus(expense, []);

      expense.transactions.forEach((transaction) => {
        transaction.statusHelper = new TransactionStatus(transaction, []);
      });
    });
  });

  // General Invoices

  const invoiceAms = detailAndIds
    .filter(
      (detailAndId) =>
        (detailAndId[0] as DocumentData).customer && (detailAndId[0] as DocumentData).code,
    )
    .map((invoiceAndId) => invoiceAndId[0] as InvoiceAm);
  const invoiceExtraArgs = () => ({ idMap });
  const generalInvoices = financeMapper.mapArray<InvoiceAm, Invoice>(
    invoiceAms,
    'InvoiceAm',
    'Invoice',
    {
      extraArgs: invoiceExtraArgs,
    },
  );

  generalInvoices.forEach((invoice) => {
    invoice.statusHelper = new InvoiceStatus(invoice, []);

    invoice.transactions.forEach((transaction) => {
      transaction.statusHelper = new TransactionStatus(transaction, []);
    });
  });

  // General Expenses

  const expenseAms = detailAndIds
    .filter((detailAndId) => (detailAndId[0] as DocumentData).supplier)
    .map((expenseAndId) => expenseAndId[0] as ExpenseAm);
  const expenseExtraArgs = () => ({ idMap });
  const generalExpenses = financeMapper.mapArray<ExpenseAm, Expense>(
    expenseAms,
    'ExpenseAm',
    'Expense',
    {
      extraArgs: expenseExtraArgs,
    },
  );

  generalExpenses.forEach((expense) => {
    expense.statusHelper = new ExpenseStatus(expense, []);

    expense.transactions.forEach((transaction) => {
      transaction.statusHelper = new TransactionStatus(transaction, []);
    });
  });

  // General Transactions

  const transactionAms = detailAndIds
    .filter((detailAndId) => (detailAndId[0] as DocumentData).type)
    .map((transactionAndId) => transactionAndId[0] as TransactionAm);
  const transactionExtraArgs = () => ({ idMap });
  const generalTransactions = financeMapper.mapArray<TransactionAm, Transaction>(
    transactionAms,
    'TransactionAm',
    'Transaction',
    {
      extraArgs: transactionExtraArgs,
    },
  );

  generalTransactions.forEach((transaction) => {
    transaction.statusHelper = new TransactionStatus(transaction, []);
  });

  return {
    projects,
    generalInvoices,
    generalExpenses,
    generalTransactions,
  };
}
