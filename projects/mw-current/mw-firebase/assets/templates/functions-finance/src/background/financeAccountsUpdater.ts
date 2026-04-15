import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import { uniqBy } from 'lodash-es';

import clearReportsCache from 'utils/clearReportsCache.js';

import type {
  ExpenseAm as Expense,
  FinanceAccountAm as FinanceAccount,
  InvoiceAm as Invoice,
  ProjectAm as Project,
  TransactionAm as Transaction,
} from 'models/finance/index.js';

export const financeAccountsUpdater = onDocumentWritten(
  'finance_financeAccounts/{id}',
  async (event) => {
    if (!event.data?.before.exists) {
      return;
    }

    const financeAccountChange = event.data as Change<DocumentSnapshot<FinanceAccount>>;
    const id = financeAccountChange.before.id;

    const db = getFirestore();

    // Update Transaction.sourceFinanceAccount, Transaction.destinationFinanceAccount

    if (financeAccountChange.after.data()?.name !== financeAccountChange.before.data()!.name) {
      const transactionsMetaDataRef = db.collectionGroup('transactionsMetaData');
      const transactionsMetaDataSnapshot = await transactionsMetaDataRef
        .where('financeAccountIds', 'array-contains', id)
        .get();
      const transactionParentRefs = uniqBy(
        transactionsMetaDataSnapshot.docs.flatMap((transactionMetaData) =>
          transactionMetaData.ref.parent.parent ? [transactionMetaData.ref.parent.parent] : [],
        ),
        (transactionParentRef) => transactionParentRef.id,
      );
      const transactionParentSnapshots = await Promise.all(
        transactionParentRefs.map((transactionParentRef) => transactionParentRef.get()),
      );

      info(
        '[finance-financeAccountsUpdater]',
        `Found ${transactionParentSnapshots.length} transaction owners for finance account "${financeAccountChange.before.data()!.name}".`,
      );

      for (const snapshot of transactionParentSnapshots) {
        if (!snapshot.exists) {
          continue;
        }

        // Project transactions
        if (snapshot.get('name')) {
          const projectSnapshot = snapshot as DocumentSnapshot<Project>;
          const project = projectSnapshot.data()!;

          info('[finance-financeAccountsUpdater]', `Updating project "${project.name}"...`);

          project.quotations.forEach((quotation) => {
            quotation.invoice?.transactions.forEach((transaction) => {
              if (transaction.sourceFinanceAccount?.id === id) {
                info(
                  '[finance-financeAccountsUpdater]',
                  '-->',
                  `Updating transaction "${transaction.code}" (${transaction.content}) for invoice "${quotation.invoice?.code}" (${quotation.invoice?.content})...`,
                );

                transaction.sourceFinanceAccount.name = financeAccountChange.after.exists
                  ? financeAccountChange.after.data()!.name
                  : `${transaction.sourceFinanceAccount.name} * DELETED *`;
              }

              if (transaction.destinationFinanceAccount?.id === id) {
                info(
                  '[finance-financeAccountsUpdater]',
                  '-->',
                  `Updating transaction "${transaction.code}" (${transaction.content}) for invoice "${quotation.invoice?.code}" (${quotation.invoice?.content})...`,
                );

                transaction.destinationFinanceAccount.name = financeAccountChange.after.exists
                  ? financeAccountChange.after.data()!.name
                  : `${transaction.destinationFinanceAccount.name} * DELETED *`;
              }
            });
          });

          await projectSnapshot.ref.set({ quotations: project.quotations }, { merge: true });

          project.expenses.forEach((expense) => {
            expense.transactions.forEach((transaction) => {
              if (transaction.sourceFinanceAccount?.id === id) {
                info(
                  '[finance-financeAccountsUpdater]',
                  '-->',
                  `Updating transaction "${transaction.code}" (${transaction.content}) for expense "${expense.code}" (${expense.content})...`,
                );

                transaction.sourceFinanceAccount.name = financeAccountChange.after.exists
                  ? financeAccountChange.after.data()!.name
                  : `${transaction.sourceFinanceAccount.name} * DELETED *`;
              }

              if (transaction.destinationFinanceAccount?.id === id) {
                info(
                  '[finance-financeAccountsUpdater]',
                  '-->',
                  `Updating transaction "${transaction.code}" (${transaction.content}) for expense "${expense.code}" (${expense.content})...`,
                );

                transaction.destinationFinanceAccount.name = financeAccountChange.after.exists
                  ? financeAccountChange.after.data()!.name
                  : `${transaction.destinationFinanceAccount.name} * DELETED *`;
              }
            });
          });

          await projectSnapshot.ref.set({ expenses: project.expenses }, { merge: true });
        }

        // General invoice transactions
        if (snapshot.get('customer') && snapshot.get('code')) {
          const invoiceSnapshot = snapshot as DocumentSnapshot<Invoice>;
          const invoice = invoiceSnapshot.data()!;

          info(
            '[finance-financeAccountsUpdater]',
            `Updating general invoice "${invoice.code}" (${invoice.content})...`,
          );

          invoice.transactions.forEach((transaction) => {
            if (transaction.sourceFinanceAccount?.id === id) {
              info(
                '[finance-financeAccountsUpdater]',
                '-->',
                `Updating transaction "${transaction.code}" (${transaction.content}) for invoice "${invoice.code}" (${invoice.content})...`,
              );

              transaction.sourceFinanceAccount.name = financeAccountChange.after.exists
                ? financeAccountChange.after.data()!.name
                : `${transaction.sourceFinanceAccount.name} * DELETED *`;
            }

            if (transaction.destinationFinanceAccount?.id === id) {
              info(
                '[finance-financeAccountsUpdater]',
                '-->',
                `Updating transaction "${transaction.code}" (${transaction.content}) for invoice "${invoice.code}" (${invoice.content})...`,
              );

              transaction.destinationFinanceAccount.name = financeAccountChange.after.exists
                ? financeAccountChange.after.data()!.name
                : `${transaction.destinationFinanceAccount.name} * DELETED *`;
            }
          });

          await invoiceSnapshot.ref.set({ transactions: invoice.transactions }, { merge: true });
        }

        // General expense transactions
        if (snapshot.get('supplier')) {
          const expenseSnapshot = snapshot as DocumentSnapshot<Expense>;
          const expense = expenseSnapshot.data()!;

          info(
            '[finance-financeAccountsUpdater]',
            `Updating general expense "${expense.code}" (${expense.content})...`,
          );

          expense.transactions.forEach((transaction) => {
            if (transaction.sourceFinanceAccount?.id === id) {
              info(
                '[finance-financeAccountsUpdater]',
                '-->',
                `Updating transaction "${transaction.code}" (${transaction.content}) for expense "${expense.code}" (${expense.content})...`,
              );

              transaction.sourceFinanceAccount.name = financeAccountChange.after.exists
                ? financeAccountChange.after.data()!.name
                : `${transaction.sourceFinanceAccount.name} * DELETED *`;
            }

            if (transaction.destinationFinanceAccount?.id === id) {
              info(
                '[finance-financeAccountsUpdater]',
                '-->',
                `Updating transaction "${transaction.code}" (${transaction.content}) for expense "${expense.code}" (${expense.content})...`,
              );

              transaction.destinationFinanceAccount.name = financeAccountChange.after.exists
                ? financeAccountChange.after.data()!.name
                : `${transaction.destinationFinanceAccount.name} * DELETED *`;
            }
          });

          await expenseSnapshot.ref.set({ transactions: expense.transactions }, { merge: true });
        }

        // General transactions
        if (snapshot.get('type')) {
          const transactionSnapshot = snapshot as DocumentSnapshot<Transaction>;
          const transaction = transactionSnapshot.data()!;

          info(
            '[finance-financeAccountsUpdater]',
            `Updating general transaction "${transaction.code}" (${transaction.content})...`,
          );

          if (transaction.sourceFinanceAccount?.id === id) {
            transaction.sourceFinanceAccount.name = financeAccountChange.after.exists
              ? financeAccountChange.after.data()!.name
              : `${transaction.sourceFinanceAccount.name} * DELETED *`;
          }

          if (transaction.destinationFinanceAccount?.id === id) {
            transaction.destinationFinanceAccount.name = financeAccountChange.after.exists
              ? financeAccountChange.after.data()!.name
              : `${transaction.destinationFinanceAccount.name} * DELETED *`;
          }

          await transactionSnapshot.ref.set(
            {
              sourceFinanceAccount: transaction.sourceFinanceAccount || null,
              destinationFinanceAccount: transaction.destinationFinanceAccount || null,
            },
            { merge: true },
          );
        }
      }

      if (financeAccountChange.after.exists) {
        info(
          '[finance-financeAccountsUpdater]',
          `Updated ${transactionParentSnapshots.length} transaction owners for finance account "${financeAccountChange.after.data()!.name}".`,
        );
      } else {
        info(
          '[finance-financeAccountsUpdater]',
          `Updated ${transactionParentSnapshots.length} transaction owners for DELETED finance account "${financeAccountChange.before.data()!.name}".`,
        );
      }
    }

    // Clear Reports cache

    await clearReportsCache();
  },
);
