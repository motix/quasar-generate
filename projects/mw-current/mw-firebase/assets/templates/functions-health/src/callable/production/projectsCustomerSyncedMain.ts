import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { CustomerAm as Customer, ProjectAm as Project } from 'models/production/index.js';

// production_projects customer synced main
export const projectsCustomerSyncedMain = onCallWithPermission(['admin'], () => {
  return liteDocsSyncedMainCollection<Project, Customer, 'customer'>(
    'production_projects',
    'production_customers',
    'customer',
    ['code', 'name'],
  );
});
