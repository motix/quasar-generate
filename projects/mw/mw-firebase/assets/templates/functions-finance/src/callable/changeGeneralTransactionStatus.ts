import type { DocumentReference } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import { HttpsError } from 'firebase-functions/v2/https';

import { extraLog } from 'utils/conditionalLog.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { TransactionAm as Transaction } from 'models/finance/index.js';

export const changeGeneralTransactionStatus = onCallWithPermission<
  { id: string; action: string },
  Promise<void>
>(['admin', 'finance'], async ({ data: { id, action }, auth }) => {
  const db = getFirestore();
  const docRef = db.doc(`finance_generalTransactions/${id}`) as DocumentReference<
    Transaction,
    Transaction
  >;
  const doc = (await docRef.get()).data();

  if (!doc) {
    return;
  }

  const status = {
    isCleared: doc.isCleared,
    isCancelled: doc.isCancelled,
  };

  switch (action) {
    case 'clear':
      status.isCleared = true;
      status.isCancelled = false;
      break;
    case 'cancel':
      status.isCancelled = true;
      break;
    case 'reset':
      if (!auth.token?.admin && !auth.token?.manager) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      status.isCleared = false;
      status.isCancelled = false;
      break;
    default:
      throw new HttpsError('invalid-argument', `action '${action}' not recognized.`);
  }

  await extraLog(
    info,
    '[finance-changeGeneralTransactionStatus]',
    `Changing status of general transaction "${doc.code}" (${doc.content}) by action "${action}"...`,
  );

  await docRef.update(status);
});
