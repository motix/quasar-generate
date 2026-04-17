import { uid } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import ExpenseStatus from 'utils/finance/Expense/ExpenseStatus.js';
import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { Expense, ExpenseAm, ExpenseVm } from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import type { StoreOptions } from 'stores/firebase-firestore/index.js';
import { useStore } from 'stores/firebase-firestore/index.js';

// Export storeOptions to allow extending from other modules
export const storeOptions: StoreOptions<Expense, ExpenseVm, ExpenseAm> = {
  mapperOptions: {
    apiModelToModelAfterMap: (_, destinations) => {
      destinations.forEach((expense) => {
        expense.statusHelper = new ExpenseStatus(expense, []);

        expense.transactions.forEach((transaction) => {
          transaction.statusHelper = new TransactionStatus(transaction, []);
        });
      });
    },
  },
};

export const useGeneralExpensesStore = useStore<Expense, ExpenseVm, ExpenseAm>(
  'GeneralExpenses',
  'finance_generalExpenses',
  financeMapper,
  'Expense',
  'ExpenseVm',
  'ExpenseAm',
  storeOptions,
);

export function useInstantGeneralExpensesStore() {
  return useStore<Expense, ExpenseVm, ExpenseAm>(
    `InstantGeneralExpenses_${uid()}`,
    'finance_generalExpenses',
    financeMapper,
    'Expense',
    'ExpenseVm',
    'ExpenseAm',
    storeOptions,
  )();
}

export const generalExpensesStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('issueDate', 'desc'),
  orderBy('createDate'),
];
