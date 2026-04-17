import type { ProductionRoleAm, ProductionRoleLite } from 'models/production/index.js';
import productionMapper from 'models/production/mapper/productionMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useProductionRoleLitesStore = useStore<ProductionRoleLite, never, ProductionRoleAm>(
  'ProductionRoleLites',
  'production_productionRoles',
  productionMapper,
  'ProductionRoleLite',
  '',
  'ProductionRoleAm',
);
