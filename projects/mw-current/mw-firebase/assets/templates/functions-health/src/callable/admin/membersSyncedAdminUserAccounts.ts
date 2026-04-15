import collectionsSyncedWithSourceId from 'utils/health/collectionsSyncedWithSourceId.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { MemberAm as Member, UserAccountAm as UserAccount } from 'models/membership/index.js';

// admin_members synced admin_userAccounts
export const membersSyncedAdminUserAccounts = onCallWithPermission(['admin'], () => {
  return collectionsSyncedWithSourceId<UserAccount, Member>(
    'admin_userAccounts',
    'admin_members',
    true,
    true,
    'fullName',
    (destDocSnapshot) => destDocSnapshot.data().uid,
    'uid',
    'email',
  );
});
