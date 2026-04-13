import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { ExpenseGroup, ExpenseGroupAm, ExpenseGroupVm } from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useExpenseGroupsStore = useStore<ExpenseGroup, ExpenseGroupVm, ExpenseGroupAm>(
  'ExpenseGroups',
  'finance_expenseGroups',
  financeMapper,
  'ExpenseGroup',
  'ExpenseGroupVm',
  'ExpenseGroupAm',
);

export const expenseGroupsStoreDefaultSort: Readonly<QueryConstraint[]> = [orderBy('name')];
