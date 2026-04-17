import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { Customer, CustomerAm } from 'models/production/index.js';
import productionMapper from 'models/production/mapper/productionMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useCustomersStore = useStore<Customer, never, CustomerAm>(
  'Customers',
  'production_customers',
  productionMapper,
  'Customer',
  '',
  'CustomerAm',
);

export const customersStoreDefaultSort: Readonly<QueryConstraint[]> = [orderBy('name')];
