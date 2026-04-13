import type { Ref } from 'vue';
import { ref } from 'vue';

import type { Member } from '../../models/index.js';

export default function useCurrentMember() {
  // Data

  const authenticatedMemberReady = ref(false);
  const authenticatedMember: Ref<Member | null> = ref(null);

  return {
    authenticatedMemberReady,
    authenticatedMember,
  };
}
