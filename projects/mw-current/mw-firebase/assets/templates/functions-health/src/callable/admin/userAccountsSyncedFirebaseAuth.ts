import type { UserRecord } from 'firebase-admin/auth';
import type { CollectionReference } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';

import listAllUsers from 'utils/listAllUsers.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';
import { collectionForeach } from 'utils/queryForeach.js';

import type { UserRole } from 'models/firebase-auth/index.js';
import { userRoles } from 'models/firebase-auth/index.js';
import type { HealthCheckResult } from 'models/health/index.js';
import type { UserAccountAm as UserAccount } from 'models/membership/index.js';

// admin_userAccounts synced Firebase Auth
export const userAccountsSyncedFirebaseAuth = onCallWithPermission(['admin'], async () => {
  const successes: string[] = [];
  const errors: string[] = [];
  const info: string[] = [];

  const users: UserRecord[] = [];
  await listAllUsers(users);

  const db = getFirestore();
  const userAccountsRef = db.collection('admin_userAccounts') as CollectionReference<UserAccount>;

  // Looks for admin_userAccounts documents not in Firebase Authentication

  let hasNonExistUserAccounts = false;
  const uids = users.map((user) => user.uid);

  if (uids.length > 0) {
    await collectionForeach<UserAccount>('admin_userAccounts', (docSnapshot) => {
      if (!uids.includes(docSnapshot.id)) {
        hasNonExistUserAccounts = true;
        errors.push(
          `\`admin_userAccounts/${docSnapshot.id}\` does not exist in Firebase Authentication.`,
        );
      }

      return Promise.resolve();
    });
  } else {
    errors.push('There is no user in Firebase Authentication.');
  }

  // Check each user in Firebase Authentication

  let hasUntransferredUser = false;
  let hasUnmatchedInfo = false;
  let hasMatchedUserAccount = false;

  for (const user of users) {
    const userAccountSnapshot = await userAccountsRef.doc(user.uid).get();
    const userAccount = userAccountSnapshot.data();

    if (userAccount) {
      hasMatchedUserAccount = true;

      if (
        userAccount.uid !== user.uid ||
        userAccount.email !== user.email ||
        userAccount.displayName !== user.displayName ||
        userAccount.photoUrl !== user.photoURL
      ) {
        hasUnmatchedInfo = true;
        errors.push(
          `\`admin_userAccounts/${userAccountSnapshot.id}\` does not have the same info as in Firebase Authentication.`,
        );
      }

      const claims: UserRole[] = [];

      if (user.customClaims) {
        for (const role of userRoles) {
          if (user.customClaims[role] === true) {
            claims.push(role);
          }
        }
      }

      if (claims.length !== userAccount.claims.length) {
        hasUnmatchedInfo = true;
        errors.push(
          `\`admin_userAccounts/${userAccountSnapshot.id}\` does not have the same claims as in Firebase Authentication.`,
        );
      } else {
        claims.forEach((claim) => {
          if (!userAccount.claims.includes(claim)) {
            hasUnmatchedInfo = true;
            errors.push(
              `\`admin_userAccounts/${userAccountSnapshot.id}\` does not have the same claims as in Firebase Authentication.`,
            );
          }
        });
      }
    } else {
      hasUntransferredUser = true;
      errors.push(
        `User with UID \`${userAccountSnapshot.id}\` not found in \`admin_userAccounts\`.`,
      );
    }
  }

  if (!hasNonExistUserAccounts) {
    if (hasMatchedUserAccount) {
      successes.push(
        'All documents in `admin_userAccounts` have related users in Firebase Authentication.',
      );
    } else {
      info.push('There is no document in `admin_userAccounts`.');
    }
  }

  if (users.length > 0 && !hasUntransferredUser) {
    successes.push(
      'All users from Firebase Authentication were transferred to `admin_userAccounts`.',
    );
  }

  if (hasMatchedUserAccount && !hasUnmatchedInfo) {
    successes.push(
      'Each document in `admin_userAccounts` has the same info as in Firebase Authentication.',
    );
  }

  const result: HealthCheckResult = {
    successes,
    errors,
    info,
  };

  return result;
});
