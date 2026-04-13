import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { Transaction, TransactionAm, TransactionVm } from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useGeneralTransactionsStore = useStore<Transaction, TransactionVm, TransactionAm>(
  'GeneralTransactions',
  'finance_generalTransactions',
  financeMapper,
  'Transaction',
  'TransactionVm',
  'TransactionAm',
  {
    mapperOptions: {
      apiModelToModelAfterMap: (_, destinations) => {
        destinations.forEach((transaction) => {
          transaction.statusHelper = new TransactionStatus(transaction, []);
        });
      },
    },
  },
);

export const generalTransactionsStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('issueDate', 'desc'),
  orderBy('createDate'),
];
