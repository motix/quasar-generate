import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type {
  ExpenseAm as Expense,
  FinanceAccountAm as FinanceAccount,
} from 'models/finance/index.js';

// finance_generalExpenses transactions finance accounts synced main
export const generalExpensesTfasSyncedMain = onCallWithPermission(['admin'], () => {
  let itemCount = 0;

  return liteDocsSyncedMainCollection<Expense, FinanceAccount, 'transactions'>(
    'finance_generalExpenses',
    'finance_financeAccounts',
    'transactions',
    [],
    {
      compare: (docSnapshot, mainDocSnapshots, fieldValue, errors) => {
        const transactions = fieldValue;

        transactions.forEach((transaction, index) => {
          itemCount++;

          if (transaction.sourceFinanceAccount != null) {
            const sourceFinanceAccountSnapshot = mainDocSnapshots.find(
              (value) => value.id === transaction.sourceFinanceAccount?.id,
            );

            if (sourceFinanceAccountSnapshot) {
              transaction.sourceFinanceAccount.name !== sourceFinanceAccountSnapshot.data().name &&
                errors.push(
                  `\`${docSnapshot.ref.path}.transactions[${index}].sourceFinanceAccount.id\` '\`${transaction.sourceFinanceAccount.id}\`' has different \`name\` from related document in \`finance_financeAccounts\`.`,
                );
            } else {
              errors.push(
                `\`${docSnapshot.ref.path}.transactions[${index}].sourceFinanceAccount.id\` '\`${transaction.sourceFinanceAccount.id}\`' does not match any document in \`finance_financeAccounts\`.`,
              );
            }
          }

          if (transaction.destinationFinanceAccount != null) {
            const destinationFinanceAccountSnapshot = mainDocSnapshots.find(
              (value) => value.id === transaction.destinationFinanceAccount?.id,
            );

            if (destinationFinanceAccountSnapshot) {
              transaction.destinationFinanceAccount.name !==
                destinationFinanceAccountSnapshot.data().name &&
                errors.push(
                  `\`${docSnapshot.ref.path}.transactions[${index}].destinationFinanceAccount.id\` '\`${transaction.destinationFinanceAccount.id}\`' has different \`name\` from related document in \`finance_financeAccounts\`.`,
                );
            } else {
              errors.push(
                `\`${docSnapshot.ref.path}.transactions[${index}].destinationFinanceAccount.id\` '\`${transaction.destinationFinanceAccount.id}\`' does not match any document in \`finance_financeAccounts\`.`,
              );
            }
          }
        });
      },
      successMessage: () =>
        `\`sourceFinanceAccount\` and \`destinationFinanceAccount\` of all ${itemCount} items(s) in \`finance_generalExpenses/{id}.transactions\` have the same info as in \`finance_financeAccounts\`.`,
    },
  );
});
