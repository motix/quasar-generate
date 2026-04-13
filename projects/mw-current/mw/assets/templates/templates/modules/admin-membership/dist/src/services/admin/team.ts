import { where } from 'firebase/firestore';

import { useInstantMembersStore } from 'stores/membership/Members.js';

export async function findMemberByUid(uid: string) {
  const store = useInstantMembersStore();

  await store.loadAllDocs({
    queryConstraints: [where('uid', '==', uid)],
  });

  const doc = store.docs[0];

  store.$dispose();

  return doc;
}
