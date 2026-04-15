import type { UserRecord } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';

import assignOptional from 'utils/assignOptional.js';
import listAllUsers from 'utils/listAllUsers.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';
import { collectionForeach } from 'utils/queryForeach.js';

import type { UserRole } from 'models/firebase-auth/index.js';
import { userRoles } from 'models/firebase-auth/index.js';
import type { UserAccountAm as UserAccount } from 'models/membership/index.js';

// Required role for service account: Firebase Authentication Admin

export const rebuildUserAccountsCollection = onCallWithPermission<never, Promise<void>>(
  ['admin'],
  async () => {
    const users: UserRecord[] = [];
    await listAllUsers(users);

    const db = getFirestore();

    // Remove non-existing accounts

    const uids = users.map((user) => user.uid);

    await collectionForeach<UserAccount>('admin_userAccounts', async (docSnapshot) => {
      if (!uids.includes(docSnapshot.id)) {
        info(
          '[admin-rebuildUserAccountsCollection]',
          `Deleting doc '${docSnapshot.id}' from admin_userAccounts.`,
        );
        await docSnapshot.ref.delete();
      }
    });

    // Update current accounts

    info(
      '[admin-rebuildUserAccountsCollection]',
      `Setting ${users.length} docs to admin_userAccounts.`,
    );

    await Promise.all(
      users.map((user) => {
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

        let key: keyof UserAccount;
        for (key in userAccount) {
          if (userAccount[key] === undefined) {
            delete userAccount[key];
          }
        }

        return db.doc(`admin_userAccounts/${userAccount.uid}`).set(userAccount);
      }),
    );
  },
);
