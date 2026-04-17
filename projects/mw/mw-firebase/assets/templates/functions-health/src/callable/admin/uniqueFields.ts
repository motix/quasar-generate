import uniqueField from 'utils/health/uniqueField.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { UserAccountAm as UserAccount } from 'models/membership/index.js';

export const membersUniqueUid = onCallWithPermission(['admin'], () => {
  return uniqueField<UserAccount>('admin_members', 'uid');
});

export const membersUniqueEmail = onCallWithPermission(['admin'], () => {
  return uniqueField<UserAccount>('admin_members', 'email');
});
