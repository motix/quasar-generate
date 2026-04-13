import { httpsCallable } from 'firebase/functions';

import type { ExpenseActionName } from 'utils/finance/Expense/ExpenseStatus.js';

import { getFunctions } from 'services/firebase.js';

export async function changeProjectExpenseStatus(
  projectId: string,
  code: string,
  action: ExpenseActionName,
) {
  const functions = getFunctions();
  const callable = httpsCallable<{ projectId: string; code: string; action: string }, void>(
    functions,
    'finance-changeProjectExpenseStatus',
  );

  try {
    await callable({ projectId, code, action });
  } catch (error) {
    throw new Error('Calling to finance-changeProjectExpenseStatus failed.', { cause: error });
  }
}
