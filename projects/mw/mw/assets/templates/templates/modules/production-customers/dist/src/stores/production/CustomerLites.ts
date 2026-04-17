import type { CustomerAm, CustomerLite } from 'models/production/index.js';
import productionMapper from 'models/production/mapper/productionMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useCustomerLitesStore = useStore<CustomerLite, never, CustomerAm>(
  'CustomerLites',
  'production_customers',
  productionMapper,
  'CustomerLite',
  '',
  'CustomerAm',
);
