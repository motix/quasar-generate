import { httpsCallable } from 'firebase/functions';

import type { TransactionActionName } from 'utils/finance/Transaction/TransactionStatus.js';

import { getFunctions } from 'services/firebase.js';

export async function changeProjectTransactionStatus(
  projectId: string,
  code: string,
  action: TransactionActionName,
) {
  const functions = getFunctions();
  const callable = httpsCallable<{ projectId: string; code: string; action: string }, void>(
    functions,
    'finance-changeProjectTransactionStatus',
  );

  try {
    await callable({ projectId, code, action });
  } catch (error) {
    throw new Error('Calling to finance-changeProjectTransactionStatus failed.', { cause: error });
  }
}
