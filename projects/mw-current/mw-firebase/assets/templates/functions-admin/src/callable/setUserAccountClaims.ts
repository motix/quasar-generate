import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import assignOptional from 'utils/assignOptional.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { UserClaims, UserRole } from 'models/firebase-auth/index.js';
import { userRoles } from 'models/firebase-auth/index.js';
import type { UserAccountAm as UserAccount } from 'models/membership/index.js';

export const setUserAccountClaims = onCallWithPermission<
  { uid: string; claims: UserRole[] },
  Promise<void>
>(['admin'], async ({ data: { uid, claims } }) => {
  const auth = getAuth();

  const customClaims: UserClaims = {};
  for (const role of userRoles) {
    customClaims[role] = claims.includes(role);
  }

  await getAuth().setCustomUserClaims(uid, customClaims);

  const user = await auth.getUser(uid);
  const userAccount = assignOptional<UserAccount>(
    {
      uid: user.uid,
      claims: claims,
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

  const db = getFirestore();
  await db.doc(`admin_userAccounts/${userAccount.uid}`).set(userAccount);
});
