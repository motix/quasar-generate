import onCallWithPermission from 'utils/onCallWithPermission.js';
import { collectionForeach } from 'utils/queryForeach.js';

import type { ExpenseAm as Expense, ProjectAm as Project } from 'models/finance/index.js';
import type { HealthCheckResult } from 'models/health/index.js';

// Finance Expenses unique code
export const expensesUniqueCode = onCallWithPermission(['admin'], async () => {
  const successes: string[] = [];
  const errors: string[] = [];
  const info: string[] = [];

  let itemCount = 0;

  const projectExpensesCodeMap: Record<string, { projectId: string; expenseIndex: number }> = {};

  await collectionForeach<Project>('finance_projects', (docSnapshot) => {
    docSnapshot.data().expenses.forEach((expense, expenseIndex) => {
      itemCount++;

      const code = expense.code;

      if (projectExpensesCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}.expenses[${expenseIndex}]\` and \`finance_projects/{${projectExpensesCodeMap[code].projectId}}.expenses[${projectExpensesCodeMap[code].expenseIndex}]\` have the same \`code\` '\`${code}\`'`,
        );
      }

      projectExpensesCodeMap[code] = {
        projectId: docSnapshot.id,
        expenseIndex,
      };
    });

    return Promise.resolve();
  });

  await collectionForeach<Expense>(
    'finance_generalExpenses',
    (docSnapshot, prevDocSnapshot) => {
      itemCount++;

      const code = docSnapshot.data().code;

      if (projectExpensesCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}\` and \`finance_projects/{${projectExpensesCodeMap[code].projectId}}.expenses[${projectExpensesCodeMap[code].expenseIndex}]\` have the same \`code\` '\`${code}\`'`,
        );
      }

      if (!prevDocSnapshot) {
        return Promise.resolve();
      }

      if (code === prevDocSnapshot.data().code) {
        errors.push(
          `\`${docSnapshot.ref.path}\` and \`${prevDocSnapshot.ref.path}\` have the same \`code\` '\`${code}\`'.`,
        );
      }

      return Promise.resolve();
    },
    'code',
  );

  if (errors.length === 0) {
    if (itemCount === 0) {
      info.push('There is no Expense.');
    } else if (itemCount > 1) {
      successes.push(`\`code\`s are unique in all ${itemCount} Expenses.`);
    } else {
      info.push('There is only 1 Expense.');
    }
  }

  const result: HealthCheckResult = {
    successes,
    errors,
    info,
  };

  return result;
});
