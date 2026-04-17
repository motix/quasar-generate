import { getAuth } from 'firebase-admin/auth';
import type { UserRecord } from 'firebase-functions/v1/auth';

import assignOptional from 'utils/assignOptional.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { UserRole } from 'models/firebase-auth/index.js';
import { userRoles } from 'models/firebase-auth/index.js';
import type { UserAccountAm as UserAccount } from 'models/membership/index.js';

export const findUserAccount = onCallWithPermission<
  { uid: string },
  Promise<UserAccount | undefined>
>(['admin'], async ({ data: { uid } }) => {
  let user: UserRecord;

  try {
    user = await getAuth().getUser(uid);
  } catch {
    return undefined;
  }

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
