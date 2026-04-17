import { httpsCallable } from 'firebase/functions';

import { getFunctions } from 'services/firebase.js';

export async function prepareProjectFinanceChannel(projectId: string) {
  const functions = getFunctions();
  const callable = httpsCallable<{ projectId: string }, void>(
    functions,
    'finance-prepareProjectFinanceChannel',
  );

  try {
    await callable({ projectId });
  } catch (error) {
    throw new Error('Calling to finance-prepareProjectFinanceChannel failed.', { cause: error });
  }
}
