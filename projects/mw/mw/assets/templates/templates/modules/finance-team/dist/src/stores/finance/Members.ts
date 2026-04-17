import { uid } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { Member, MemberAm } from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useMembersStore = useStore<Member, never, MemberAm>(
  'Members',
  'finance_members',
  financeMapper,
  'Member',
  '',
  'MemberAm',
);

export function useInstantMembersStore() {
  return useStore<Member, never, MemberAm>(
    `InstantMembers_${uid()}`,
    'finance_members',
    financeMapper,
    'Member',
    '',
    'MemberAm',
  )();
}

export const membersStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('fullName'),
  orderBy('email'),
];
