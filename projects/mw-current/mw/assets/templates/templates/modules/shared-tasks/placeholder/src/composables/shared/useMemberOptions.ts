import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import type { Member, MemberLite } from '../../models/index.js';

export default function useMemberOptions() {
  // Data

  const memberOptions: Ref<MemberLite[]> = ref([]);

  const membersEditorDependenciesStore = {
    store: {
      loadAllDocs: () => Promise.resolve(),
      releaseDocs: () => {},
    },
    payload: {},
  };

  // Computed

  const members = computed<Member[]>(() => []);

  // Methods

  function filterMemberOptions() {}

  return {
    memberOptions,
    membersEditorDependenciesStore,
    members,
    filterMemberOptions,
  };
}
