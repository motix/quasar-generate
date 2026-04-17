import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { Supplier, SupplierAm, SupplierVm } from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useSuppliersStore = useStore<Supplier, SupplierVm, SupplierAm>(
  'Suppliers',
  'finance_suppliers',
  financeMapper,
  'Supplier',
  'SupplierVm',
  'SupplierAm',
);

export const suppliersStoreDefaultSort: Readonly<QueryConstraint[]> = [orderBy('name')];
