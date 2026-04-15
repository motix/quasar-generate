import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { region } from 'firebase-functions/v1';

import assignOptional from 'utils/assignOptional.js';

import type { UserClaims } from 'models/firebase-auth/index.js';
import type { UserAccountAm as UserAccount } from 'models/membership/index.js';

export const processSignUp = region('asia-southeast2')
  .auth.user()
  .onCreate(async (user) => {
    const customClaims: UserClaims = {
      admin: false,
    };

    const auth = getAuth();

    const isFirstUser = (await auth.listUsers(2)).users.length === 1;

    if (isFirstUser && user.email && user.emailVerified) {
      customClaims.admin = true;
    }

    await auth.setCustomUserClaims(user.uid, customClaims);

    const db = getFirestore();

    const userAccount = assignOptional<UserAccount>(
      {
        uid: user.uid,
        claims: customClaims.admin ? ['admin'] : [],
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

    await db.doc(`admin_userAccounts/${userAccount.uid}`).set(userAccount);
  });
