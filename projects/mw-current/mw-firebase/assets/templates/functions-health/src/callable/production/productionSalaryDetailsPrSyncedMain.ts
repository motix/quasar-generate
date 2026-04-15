import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type {
  ProductionRoleAm as ProductionRole,
  ProductionSalaryDetailAm as ProductionSalaryDetail,
} from 'models/production/index.js';

// productionSalaryDetails productionRole synced main
export const productionSalaryDetailsPrSyncedMain = onCallWithPermission(['admin'], () => {
  return liteDocsSyncedMainCollection<ProductionSalaryDetail, ProductionRole, 'productionRole'>(
    'productionSalaryDetails',
    'production_productionRoles',
    'productionRole',
    ['name', 'position'],
    {
      useCollectionGroup: true,
    },
  );
});
