import collectionsSynced from 'utils/health/collectionsSynced.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { MemberAm as AdminMember } from 'models/membership/index.js';
import type { MemberAm as ProductionMember } from 'models/production/index.js';

// production_members synced admin_members
export const membersSyncedAdminMembers = onCallWithPermission(['admin'], () => {
  return collectionsSynced<AdminMember, ProductionMember>(
    'admin_members',
    'production_members',
    false,
    false,
    'fullName',
    'uid',
    'isActive',
    'email',
    'fullName',
    'photoUrl',
  );
});
