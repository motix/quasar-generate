import { uid } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { FinanceAccount, FinanceAccountAm, FinanceAccountVm } from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useFinanceAccountsStore = useStore<FinanceAccount, FinanceAccountVm, FinanceAccountAm>(
  'FinanceAccounts',
  'finance_financeAccounts',
  financeMapper,
  'FinanceAccount',
  'FinanceAccountVm',
  'FinanceAccountAm',
);

export function useInstantFinanceAccountsStore() {
  return useStore<FinanceAccount, never, FinanceAccountAm>(
    `InstantFinanceAccounts_${uid()}`,
    'finance_financeAccounts',
    financeMapper,
    'FinanceAccount',
    '',
    'FinanceAccountAm',
  )();
}

export const financeAccountsStoreDefaultSort: Readonly<QueryConstraint[]> = [orderBy('name')];
