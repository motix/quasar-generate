import collectionsSynced from 'utils/health/collectionsSynced.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { CustomerAm as FinanceCustomer } from 'models/finance/index.js';
import type { CustomerAm as ProductionCustomer } from 'models/production/index.js';

// production_customers synced finance_customers
export const customersSyncedFinanceCustomers = onCallWithPermission(['admin'], () => {
  return collectionsSynced<FinanceCustomer, ProductionCustomer>(
    'finance_customers',
    'production_customers',
    false,
    false,
    'name',
    'isActive',
    'code',
    'name',
  );
});
