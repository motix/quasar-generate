import { uid } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { Member, MemberAm, MemberVm } from 'models/membership/index.js';
import membershipMapper from 'models/membership/mapper/membershipMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useMembersStore = useStore<Member, MemberVm, MemberAm>(
  'Members',
  'admin_members',
  membershipMapper,
  'Member',
  'MemberVm',
  'MemberAm',
);

export function useInstantMembersStore() {
  return useStore<Member, MemberVm, MemberAm>(
    `InstantMembers_${uid()}`,
    'admin_members',
    membershipMapper,
    'Member',
    'MemberVm',
    'MemberAm',
  )();
}

export const membersStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('fullName'),
  orderBy('email'),
];
