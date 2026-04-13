import { httpsCallable } from 'firebase/functions';

import { getFunctions } from 'services/firebase.js';

export async function runServerFunction() {
  const functions = getFunctions();
  const callable = httpsCallable<undefined, string>(functions, 'admin-runServerFunction');

  try {
    const result = await callable();
    const data = result.data;
    return data;
  } catch (error) {
    throw new Error('Calling to admin-runServerFunction failed.', { cause: error });
  }
}
