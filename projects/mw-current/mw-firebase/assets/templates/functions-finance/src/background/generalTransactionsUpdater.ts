import type { CollectionReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import clearReportsCache from 'utils/clearReportsCache.js';
import { collectionForeach } from 'utils/queryForeach.js';

import type { TransactionAm as Transaction } from 'models/finance/index.js';

export const generalTransactionsUpdater = onDocumentWritten(
  'finance_generalTransactions/{id}',
  async (event) => {
    if (!event.data) {
      return;
    }

    const transactionChange = event.data as Change<DocumentSnapshot<Transaction>>;
    const beforeOrAfterTransaction =
      transactionChange.before.data() ||
      transactionChange.after.data() ||
      (() => {
        throw new Error('Both before and after data do not exist.'); // There's no scenario where this happens.
      })();

    const transactionsMetaDataCollectionPath = `finance_generalTransactions/${transactionChange.after.id}/transactionsMetaData`;

    info(
      '[finance-generalTransactionsUpdater]',
      `Deleting all transaction meta data for general transaction "${beforeOrAfterTransaction.code}" (${beforeOrAfterTransaction.content}) at "${transactionsMetaDataCollectionPath}"...`,
    );

    await collectionForeach(transactionsMetaDataCollectionPath, async (docSnapshot) => {
      await docSnapshot.ref.delete();
    });

    if (!transactionChange.after.exists) {
      return;
    }

    // Update finance_generalTransactions/{id}/transactionsMetaData

    const db = getFirestore();
    const transactionsMetaDataRef = db.collection(
      transactionsMetaDataCollectionPath,
    ) as CollectionReference<{
      issueDate: Transaction['issueDate'];
      financeAccountIds: string[];
    }>;

    const transaction = transactionChange.after.data()!;
    const metaDataRecord = {
      issueDate: transaction.issueDate,
      financeAccountIds: [
        ...(transaction.sourceFinanceAccount ? [transaction.sourceFinanceAccount.id] : []),
        ...(transaction.destinationFinanceAccount
          ? [transaction.destinationFinanceAccount.id]
          : []),
      ],
    };

    info(
      '[finance-generalTransactionsUpdater]',
      `Adding transaction meta data record for general transaction "${transaction.code}" (${transaction.content}) at "${transactionsMetaDataCollectionPath}"...`,
    );

    await transactionsMetaDataRef.add(metaDataRecord);

    // Clear Reports cache

    await clearReportsCache();
  },
);
