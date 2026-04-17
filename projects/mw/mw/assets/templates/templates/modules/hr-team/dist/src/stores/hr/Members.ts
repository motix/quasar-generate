import { uid } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { Member, MemberAm, MemberVm } from 'models/hr/index.js';
import hrMapper from 'models/hr/mapper/hrMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useMembersStore = useStore<Member, MemberVm, MemberAm>(
  'Members',
  'hr_members',
  hrMapper,
  'Member',
  'MemberVm',
  'MemberAm',
);

export function useInstantMembersStore() {
  return useStore<Member, MemberVm, MemberAm>(
    `InstantMembers_${uid()}`,
    'hr_members',
    hrMapper,
    'Member',
    'MemberVm',
    'MemberAm',
  )();
}

export const membersStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('fullName'),
  orderBy('email'),
];
