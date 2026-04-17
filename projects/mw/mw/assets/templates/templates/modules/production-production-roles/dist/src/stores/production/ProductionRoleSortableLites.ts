import { uid } from 'quasar';

import type { ProductionRoleAm, ProductionRoleSortableLite } from 'models/production/index.js';
import productionMapper from 'models/production/mapper/productionMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useProductionRoleSortableLitesStore = useStore<
  ProductionRoleSortableLite,
  never,
  ProductionRoleAm
>(
  'ProductionRoleSortableLites',
  'production_productionRoles',
  productionMapper,
  'ProductionRoleSortableLite',
  '',
  'ProductionRoleAm',
);

export function useInstantProductionRoleSortableLitesStore() {
  return useStore<ProductionRoleSortableLite, never, ProductionRoleAm>(
    `InstantProductionRoleSortableLites_${uid()}`,
    'production_productionRoles',
    productionMapper,
    'ProductionRoleSortableLite',
    '',
    'ProductionRoleAm',
  )();
}
