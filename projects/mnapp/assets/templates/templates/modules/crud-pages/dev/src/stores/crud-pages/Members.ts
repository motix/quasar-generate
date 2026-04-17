import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { Member, MemberAm, MemberVm } from 'models/crud-pages/index.js';
import membershipMapper from 'models/crud-pages/mapper/membershipMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useMembersStore = useStore<Member, MemberVm, MemberAm>(
  'Members',
  'admin_members',
  membershipMapper,
  'Member',
  'MemberVm',
  'MemberAm',
);

export const membersStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('fullName'),
  orderBy('email'),
];
