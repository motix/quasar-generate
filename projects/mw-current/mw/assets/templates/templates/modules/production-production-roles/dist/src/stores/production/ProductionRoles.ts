import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type {
  ProductionRole,
  ProductionRoleAm,
  ProductionRoleVm,
} from 'models/production/index.js';
import productionMapper from 'models/production/mapper/productionMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useProductionRolesStore = useStore<ProductionRole, ProductionRoleVm, ProductionRoleAm>(
  'ProductionRoles',
  'production_productionRoles',
  productionMapper,
  'ProductionRole',
  'ProductionRoleVm',
  'ProductionRoleAm',
);

export const productionRolesStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('position'),
  orderBy('name'),
];
