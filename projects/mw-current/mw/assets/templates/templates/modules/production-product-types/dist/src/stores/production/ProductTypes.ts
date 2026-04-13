import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { ProductType, ProductTypeAm, ProductTypeVm } from 'models/production/index.js';
import productionMapper from 'models/production/mapper/productionMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useProductTypesStore = useStore<ProductType<never>, ProductTypeVm, ProductTypeAm>(
  'ProductTypes',
  'production_productTypes',
  productionMapper,
  'ProductType',
  'ProductTypeVm',
  'ProductTypeAm',
);

export const productTypesStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('position'),
  orderBy('name'),
];
