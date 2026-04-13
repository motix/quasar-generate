import type { Ref } from 'vue';
import { ref } from 'vue';

import { where } from 'firebase/firestore';

import type { Member } from 'models/production/index.js';

import { useInstantMembersStore } from 'stores/production/Members.js';

import useFirebaseAuth from 'composables/useFirebaseAuth.js';

export default function useCurrentMember() {
  // Composables

  const { authenticatedUser } = useFirebaseAuth();
  const membersStore = useInstantMembersStore();

  // Data

  const authenticatedMemberReady = ref(false);
  const authenticatedMember: Ref<Member | null> = ref(null);

  // Private Executions

  membersStore
    .loadAllDocs({
      queryConstraints: [where('uid', '==', authenticatedUser.value.uid)],
    })
    .then(() => {
      authenticatedMember.value =
        membersStore.docs.length === 0
          ? null
          : membersStore.docs[0] ||
            (() => {
              throw new Error('[production-team] There is no member matches current user.');
            })();
      authenticatedMemberReady.value = true;

      membersStore.$dispose();
    })
    .catch(() => {
      throw new Error('[production-team] Failed to load member');
    });

  return {
    authenticatedMemberReady,
    authenticatedMember,
  };
}
