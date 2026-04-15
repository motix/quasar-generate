import type { CollectionReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import clearReportsCache from 'utils/clearReportsCache.js';
import { collectionForeach } from 'utils/queryForeach.js';

import type { ExpenseAm as Expense, TransactionAm as Transaction } from 'models/finance/index.js';

export const generalExpensesUpdater = onDocumentWritten(
  'finance_generalExpenses/{id}',
  async (event) => {
    if (!event.data) {
      return;
    }

    const expenseChange = event.data as Change<DocumentSnapshot<Expense>>;
    const beforeOrAfterExpense =
      expenseChange.before.data() ||
      expenseChange.after.data() ||
      (() => {
        throw new Error('Both before and after data do not exist.'); // There's no scenario where this happens.
      })();

    const transactionsMetaDataCollectionPath = `finance_generalExpenses/${expenseChange.after.id}/transactionsMetaData`;

    info(
      '[finance-generalExpensesUpdater]',
      `Deleting all transaction meta data for general expense "${beforeOrAfterExpense.code}" (${beforeOrAfterExpense.content}) at "${transactionsMetaDataCollectionPath}"...`,
    );

    await collectionForeach(transactionsMetaDataCollectionPath, async (docSnapshot) => {
      await docSnapshot.ref.delete();
    });

    if (!expenseChange.after.exists) {
      return;
    }

    // Update finance_generalExpenses/{id}/transactionsMetaData

    const db = getFirestore();
    const transactionsMetaDataRef = db.collection(
      transactionsMetaDataCollectionPath,
    ) as CollectionReference<{
      issueDate: Transaction['issueDate'];
      financeAccountIds: string[];
    }>;

    const expense = expenseChange.after.data()!;
    const metaDataRecords = [
      ...expense.transactions.map((value) => ({
        issueDate: value.issueDate,
        supplierId: expense.supplier.id,
        financeAccountIds: [
          ...(value.sourceFinanceAccount ? [value.sourceFinanceAccount.id] : []),
          ...(value.destinationFinanceAccount ? [value.destinationFinanceAccount.id] : []),
        ],
      })),
    ];

    info(
      '[finance-generalExpensesUpdater]',
      `Adding ${metaDataRecords.length} transaction meta data records for general expense "${expense.code}" (${expense.content}) at "${transactionsMetaDataCollectionPath}"...`,
    );

    for (const record of metaDataRecords) {
      await transactionsMetaDataRef.add(record);
    }

    // Clear Reports cache

    await clearReportsCache();
  },
);
