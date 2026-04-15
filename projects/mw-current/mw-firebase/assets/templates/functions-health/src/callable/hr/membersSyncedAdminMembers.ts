import collectionsSynced from 'utils/health/collectionsSynced.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { MemberAm as HrMember } from 'models/hr/index.js';
import type { MemberAm as AdminMember } from 'models/membership/index.js';

// hr_members synced admin_members
export const membersSyncedAdminMembers = onCallWithPermission(['admin'], () => {
  return collectionsSynced<AdminMember, HrMember>(
    'admin_members',
    'hr_members',
    false,
    false,
    'fullName',
    'isActive',
    'email',
    'fullName',
    'photoUrl',
  );
});
