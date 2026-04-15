import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { MemberAm as Member, ProjectAm as Project } from 'models/production/index.js';

// production_projects owner synced main
export const projectsOwnerSyncedMain = onCallWithPermission(['admin'], () => {
  return liteDocsSyncedMainCollection<Project, Member, 'owner'>(
    'production_projects',
    'production_members',
    'owner',
    ['fullName'],
  );
});
