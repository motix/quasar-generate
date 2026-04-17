import { httpsCallable } from 'firebase/functions';

import type { UserRole } from 'models/firebase-auth/index.js';
import type { UserAccount } from 'models/membership/index.js';

import { getFunctions } from 'services/firebase.js';

export async function listUserAccounts() {
  const functions = getFunctions();
  const callable = httpsCallable<never, UserAccount[]>(functions, 'admin-listUserAccounts');

  try {
    const result = await callable();
    const accounts = result.data;
    return accounts;
  } catch (error) {
    throw new Error('Calling to admin-listUserAccounts failed.', { cause: error });
  }
}

export async function rebuildUserAccountsCollection() {
  const functions = getFunctions();
  const callable = httpsCallable<undefined, void>(functions, 'admin-rebuildUserAccountsCollection');

  try {
    await callable();
  } catch (error) {
    throw new Error('Calling to admin-rebuildUserAccountsCollection failed.', { cause: error });
  }
}

export async function setUserAccountClaims(uid: string, claims: UserRole[]) {
  const functions = getFunctions();
  const callable = httpsCallable<{ uid: string; claims: UserRole[] }, void>(
    functions,
    'admin-setUserAccountClaims',
  );

  try {
    await callable({ uid, claims });
  } catch (error) {
    throw new Error('Calling to admin-setUserAccountClaims failed.', { cause: error });
  }
}

export async function findUserAccount(uid: string) {
  const functions = getFunctions();
  const callable = httpsCallable<{ uid: string }, UserAccount | undefined>(
    functions,
    'admin-findUserAccount',
  );

  try {
    const result = await callable({ uid });
    const account = result.data;
    return account;
  } catch (error) {
    throw new Error('Calling to admin-findUserAccount failed.', { cause: error });
  }
}
