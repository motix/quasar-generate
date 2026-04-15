import { getAuth } from 'firebase-admin/auth';
import { info } from 'firebase-functions/logger';

import { extraLog } from 'utils/conditionalLog.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

// Required role for service account: Service Account Token Creator

export const createAuthToken = onCallWithPermission<never, Promise<string>>(
  [],
  async ({ auth }) => {
    const firebaseAuth = getAuth();
    const token = await firebaseAuth.createCustomToken(auth.uid);

    await extraLog(
      info,
      '[auth-createAuthToken]',
      `Token created as "${token.substring(0, 5)}...".`,
    );

    return token;
  },
);
