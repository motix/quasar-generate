import { uid } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { Member, MemberAm } from 'models/production/index.js';
import productionMapper from 'models/production/mapper/productionMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useMembersStore = useStore<Member, never, MemberAm>(
  'Members',
  'production_members',
  productionMapper,
  'Member',
  '',
  'MemberAm',
);

export function useInstantMembersStore() {
  return useStore<Member, never, MemberAm>(
    `InstantMembers_${uid()}`,
    'production_members',
    productionMapper,
    'Member',
    '',
    'MemberAm',
  )();
}

export const membersStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('fullName'),
  orderBy('email'),
];
