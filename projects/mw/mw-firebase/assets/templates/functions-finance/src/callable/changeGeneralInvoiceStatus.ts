import type { DocumentReference } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import { HttpsError } from 'firebase-functions/v2/https';

import { extraLog } from 'utils/conditionalLog.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { InvoiceAm as Invoice } from 'models/finance/index.js';

export const changeGeneralInvoiceStatus = onCallWithPermission<
  { id: string; action: string },
  Promise<void>
>(['admin', 'finance'], async ({ data: { id, action }, auth }) => {
  const db = getFirestore();
  const docRef = db.doc(`finance_generalInvoices/${id}`) as DocumentReference<Invoice, Invoice>;
  const doc = (await docRef.get()).data();

  if (!doc) {
    return;
  }

  const status = {
    isCompleted: doc.isCompleted,
    isApproved: doc.isApproved,
    isRejected: doc.isRejected,
    isSentToCustomer: doc.isSentToCustomer,
    isCancelled: doc.isCancelled,
  };

  switch (action) {
    case 'complete':
      status.isCompleted = true;
      status.isApproved = false;
      status.isSentToCustomer = false;
      status.isCancelled = false;
      break;
    case 'approve':
      if (!auth.token?.admin && !auth.token?.manager) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      status.isCompleted = true;
      status.isApproved = true;
      status.isSentToCustomer = false;
      status.isCancelled = false;
      break;
    case 'reject':
      if (!auth.token?.admin && !auth.token?.manager) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      status.isCompleted = false;
      status.isApproved = false;
      status.isRejected = true;
      status.isSentToCustomer = false;
      status.isCancelled = false;
      break;
    case 'sendToCustomer':
      if (!status.isApproved) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      status.isCompleted = true;
      status.isSentToCustomer = true;
      status.isCancelled = false;
      break;
    case 'cancel':
      status.isCancelled = true;
      break;
    case 'reset':
      if (!auth.token?.admin && !auth.token?.manager) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      status.isCompleted = false;
      status.isApproved = false;
      status.isRejected = false;
      status.isSentToCustomer = false;
      status.isCancelled = false;
      break;
    default:
      throw new HttpsError('invalid-argument', `action '${action}' not recognized.`);
  }

  await extraLog(
    info,
    '[finance-changeGeneralInvoiceStatus]',
    `Changing status of general invoice "${doc.code}" (${doc.content}) by action "${action}"...`,
  );

  await docRef.update(status);
});
