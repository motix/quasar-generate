import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import { findIndex } from 'lodash-es';

import type { UserAccount, UserAccountAm } from 'models/membership/index.js';
import membershipMapper from 'models/membership/mapper/membershipMapper.js';

import type { UpdateDocActionPayload } from 'stores/firebase-firestore/index.js';
import { useStore } from 'stores/firebase-firestore/index.js';

import { setUserAccountClaims } from 'services/admin/accounts.js';

export const useUserAccountsStore = useStore<UserAccount, never, UserAccountAm>(
  'UserAccounts',
  'admin_userAccounts',
  membershipMapper,
  'UserAccount',
  '',
  'UserAccountAm',
);

export const userAccountsStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('displayName'),
  orderBy('uid'),
];

const store = useUserAccountsStore();

store.updateDoc = async ({ docKey, doc: docVm }: UpdateDocActionPayload<UserAccount>) => {
  const uid =
    store.realtimeDocs[docKey]?.doc?.uid ||
    (() => {
      throw new Error(`Realtime doc '${docKey}' not available.`);
    })();

  await setUserAccountClaims(uid, docVm.claims);

  store.releaseDocs({ immediately: true });

  const newDocM: UserAccount = {
    ...docVm,
    id: uid,
  };

  const index = findIndex(store.recentlyUpdatedDocs, ['id', uid]);

  if (index > -1) {
    store.recentlyUpdatedDocs[index] = newDocM;
  } else {
    store.recentlyUpdatedDocs.push(newDocM);
  }
};
