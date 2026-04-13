import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { Customer, CustomerAm, CustomerVm } from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useCustomersStore = useStore<Customer, CustomerVm, CustomerAm>(
  'Customers',
  'finance_customers',
  financeMapper,
  'Customer',
  'CustomerVm',
  'CustomerAm',
);

export const customersStoreDefaultSort: Readonly<QueryConstraint[]> = [orderBy('name')];
