import { httpsCallable } from 'firebase/functions';

import type { TransactionActionName } from 'utils/finance/Transaction/TransactionStatus.js';

import { getFunctions } from 'services/firebase.js';

export async function changeGeneralTransactionStatus(id: string, action: TransactionActionName) {
  const functions = getFunctions();
  const callable = httpsCallable<{ id: string; action: string }, void>(
    functions,
    'finance-changeGeneralTransactionStatus',
  );

  try {
    await callable({ id, action });
  } catch (error) {
    throw new Error('Calling to finance-changeGeneralTransactionStatus failed.', { cause: error });
  }
}
