import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type {
  MemberAm as Member,
  ProductionRoleAm as ProductionRole,
} from 'models/production/index.js';

// production_members defaultProductionRole synced main
export const membersDprSyncedMain = onCallWithPermission(['admin'], () => {
  return liteDocsSyncedMainCollection<Member, ProductionRole, 'defaultProductionRole'>(
    'production_members',
    'production_productionRoles',
    'defaultProductionRole',
    ['name'],
  );
});
