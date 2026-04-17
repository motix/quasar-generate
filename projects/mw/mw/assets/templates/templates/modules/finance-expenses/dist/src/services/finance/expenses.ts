import { httpsCallable } from 'firebase/functions';

import type { ExpenseActionName } from 'utils/finance/Expense/ExpenseStatus.js';
import type { TransactionActionName } from 'utils/finance/Transaction/TransactionStatus.js';

import { getFunctions } from 'services/firebase.js';

export async function changeGeneralExpenseStatus(id: string, action: ExpenseActionName) {
  const functions = getFunctions();
  const callable = httpsCallable<{ id: string; action: string }, void>(
    functions,
    'finance-changeGeneralExpenseStatus',
  );

  try {
    await callable({ id, action });
  } catch (error) {
    throw new Error('Calling to finance-changeGeneralExpenseStatus failed.', { cause: error });
  }
}

export async function changeGeneralExpenseTransactionStatus(
  expenseId: string,
  code: string,
  action: TransactionActionName,
) {
  const functions = getFunctions();
  const callable = httpsCallable<{ expenseId: string; code: string; action: string }, void>(
    functions,
    'finance-changeGeneralExpenseTransactionStatus',
  );

  try {
    await callable({ expenseId, code, action });
  } catch (error) {
    throw new Error('Calling to finance-changeGeneralExpenseTransactionStatus failed.', {
      cause: error,
    });
  }
}
