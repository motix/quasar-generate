import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import type { QSelectProps } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { where } from 'firebase/firestore';

import type { Member, MemberLite } from 'models/finance/index.js';

import { membersStoreDefaultSort, useMembersStore } from 'stores/finance/Members.js';

export default function useMemberOptions(...queryConstraints: QueryConstraint[]) {
  // Composables

  const membersStore = useMembersStore();

  // Data

  const memberOptions: Ref<MemberLite[]> = ref([]);

  const membersEditorDependenciesStore = {
    store: membersStore,
    payload: {
      queryConstraints: [
        where('isActive', '==', true),
        ...queryConstraints,
        ...membersStoreDefaultSort,
      ],
    },
  };

  // Computed

  const members = computed<Member[]>(() => {
    return membersStore.docs;
  });

  // Methods

  function filterMemberOptions(
    ...[inputValue, doneFn]: Parameters<Required<QSelectProps>['onFilter']>
  ) {
    function buildOptions(filteredMembers: Member[]) {
      return filteredMembers.map<MemberLite>((value) => ({
        id: value.id,
        fullName: value.fullName,
      }));
    }

    if (inputValue === '') {
      doneFn(() => {
        memberOptions.value = buildOptions(members.value);
      });

      return;
    }

    doneFn(() => {
      const search = inputValue.toLowerCase();
      memberOptions.value = buildOptions(
        members.value.filter((value) => value.fullName.toLowerCase().includes(search)),
      );
    });
  }

  return {
    membersStore,
    memberOptions,
    membersEditorDependenciesStore,
    members,
    filterMemberOptions,
  };
}
