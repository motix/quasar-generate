import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type {
  CustomerAm as Customer,
  SalesContractAm as SalesContract,
} from 'models/finance/index.js';

// finance_salesContracts customer synced main
export const salesContractsCustomerSyncedMain = onCallWithPermission(['admin'], () => {
  return liteDocsSyncedMainCollection<SalesContract, Customer, 'customer'>(
    'finance_salesContracts',
    'finance_customers',
    'customer',
    ['code', 'name'],
  );
});
