import type { UserRecord } from 'firebase-admin/auth';

import assignOptional from 'utils/assignOptional.js';
import listAllUsers from 'utils/listAllUsers.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { UserRole } from 'models/firebase-auth/index.js';
import { userRoles } from 'models/firebase-auth/index.js';
import type { UserAccountAm as UserAccount } from 'models/membership/index.js';

// Required role for service account: Firebase Authentication Admin

export const listUserAccounts = onCallWithPermission<never, Promise<UserAccount[]>>(
  ['admin'],
  async () => {
    const users: UserRecord[] = [];
    await listAllUsers(users);

    const userAccounts = users.map((user) => {
      const claims: UserRole[] = [];

      if (user.customClaims) {
        for (const role of userRoles) {
          if (user.customClaims[role] === true) {
            claims.push(role);
          }
        }
      }

      const userAccount = assignOptional<UserAccount>(
        {
          uid: user.uid,
          claims,
        },
        {
          email: user.email,
          displayName: user.displayName,
          photoUrl: user.photoURL,
        },
      );

      return userAccount;
    });

    return userAccounts;
  },
);
