import { httpsCallable } from 'firebase/functions';

import { getFunctions } from 'services/firebase.js';

export async function generateCode(prefix: string, ...parts: string[]) {
  const functions = getFunctions();
  const callable = httpsCallable<{ prefix: string; parts: string[] }, string>(
    functions,
    'global-generateCode',
  );

  try {
    const result = await callable({ prefix, parts });
    return result.data;
  } catch (error) {
    throw new Error('Calling to global-generateCode failed.', { cause: error });
  }
}

export async function regenerateCode(oldCode: string, ...parts: string[]) {
  return generateCode(oldCode.substring(0, oldCode.indexOf('-') + 1), ...parts);
}
