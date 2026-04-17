import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type {
  FinanceAccountAm as FinanceAccount,
  ProjectAm as Project,
} from 'models/finance/index.js';
import type { HealthCheckResult } from 'models/health/index.js';

// finance_projects transactions finance accounts synced main
export const projectsTfasSyncedMain = onCallWithPermission(['admin'], async () => {
  let itemCount = 0;

  const invoicesResult = await liteDocsSyncedMainCollection<Project, FinanceAccount, 'quotations'>(
    'finance_projects',
    'finance_financeAccounts',
    'quotations',
    [],
    {
      compare: (docSnapshot, mainDocSnapshots, fieldValue, errors) => {
        const quotations = fieldValue;

        quotations.forEach((quotation, quotationIndex) => {
          quotation.invoice?.transactions.forEach((transaction, transactionIndex) => {
            itemCount++;

            if (transaction.sourceFinanceAccount != null) {
              const sourceFinanceAccountSnapshot = mainDocSnapshots.find(
                (value) => value.id === transaction.sourceFinanceAccount?.id,
              );

              if (sourceFinanceAccountSnapshot) {
                transaction.sourceFinanceAccount.name !==
                  sourceFinanceAccountSnapshot.data().name &&
                  errors.push(
                    `\`${docSnapshot.ref.path}.quotations[${quotationIndex}].invoice.transactions[${transactionIndex}].sourceFinanceAccount.id\` '\`${transaction.sourceFinanceAccount.id}\`' has different \`name\` from related document in \`finance_financeAccounts\`.`,
                  );
              } else {
                errors.push(
                  `\`${docSnapshot.ref.path}.quotations[${quotationIndex}].invoice.transactions[${transactionIndex}].sourceFinanceAccount.id\` '\`${transaction.sourceFinanceAccount.id}\`' does not match any document in \`finance_financeAccounts\`.`,
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
                    `\`${docSnapshot.ref.path}.quotations[${quotationIndex}].invoice.transactions[${transactionIndex}].destinationFinanceAccount.id\` '\`${transaction.destinationFinanceAccount.id}\`' has different \`name\` from related document in \`finance_financeAccounts\`.`,
                  );
              } else {
                errors.push(
                  `\`${docSnapshot.ref.path}.quotations[${quotationIndex}].invoice.transactions[${transactionIndex}].destinationFinanceAccount.id\` '\`${transaction.destinationFinanceAccount.id}\`' does not match any document in \`finance_financeAccounts\`.`,
                );
              }
            }
          });
        });
      },
      successMessage: () =>
        `\`sourceFinanceAccount\` and \`destinationFinanceAccount\` of all ${itemCount} items(s) in \`finance_projects/{id}.quotations[index].invoice.transactions\` have the same info as in \`finance_financeAccounts\`.`,
    },
  );

  itemCount = 0;

  const expensesResult = await liteDocsSyncedMainCollection<Project, FinanceAccount, 'expenses'>(
    'finance_projects',
    'finance_financeAccounts',
    'expenses',
    [],
    {
      compare: (docSnapshot, mainDocSnapshots, fieldValue, errors) => {
        const expenses = fieldValue;

        expenses.forEach((expense, expenseIndex) => {
          expense.transactions.forEach((transaction, transactionIndex) => {
            itemCount++;

            if (transaction.sourceFinanceAccount != null) {
              const sourceFinanceAccountSnapshot = mainDocSnapshots.find(
                (value) => value.id === transaction.sourceFinanceAccount?.id,
              );

              if (sourceFinanceAccountSnapshot) {
                transaction.sourceFinanceAccount.name !==
                  sourceFinanceAccountSnapshot.data().name &&
                  errors.push(
                    `\`${docSnapshot.ref.path}.expenses[${expenseIndex}].transactions[${transactionIndex}].sourceFinanceAccount.id\` '\`${transaction.sourceFinanceAccount.id}\`' has different \`name\` from related document in \`finance_financeAccounts\`.`,
                  );
              } else {
                errors.push(
                  `\`${docSnapshot.ref.path}.expenses[${expenseIndex}].transactions[${transactionIndex}].sourceFinanceAccount.id\` '\`${transaction.sourceFinanceAccount.id}\`' does not match any document in \`finance_financeAccounts\`.`,
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
                    `\`${docSnapshot.ref.path}.expenses[${expenseIndex}].transactions[${transactionIndex}].destinationFinanceAccount.id\` '\`${transaction.destinationFinanceAccount.id}\`' has different \`name\` from related document in \`finance_financeAccounts\`.`,
                  );
              } else {
                errors.push(
                  `\`${docSnapshot.ref.path}.expenses[${expenseIndex}].transactions[${transactionIndex}].destinationFinanceAccount.id\` '\`${transaction.destinationFinanceAccount.id}\`' does not match any document in \`finance_financeAccounts\`.`,
                );
              }
            }
          });
        });
      },
      successMessage: () =>
        `\`sourceFinanceAccount\` and \`destinationFinanceAccount\` of all ${itemCount} items(s) in \`finance_projects/{id}.expenses[index].transactions\` have the same info as in \`finance_financeAccounts\`.`,
    },
  );

  const result: HealthCheckResult = {
    successes: [...invoicesResult.successes, ...expensesResult.successes],
    errors: [...invoicesResult.errors, ...expensesResult.errors],
    info: [...invoicesResult.info, ...expensesResult.info],
  };

  return result;
});
