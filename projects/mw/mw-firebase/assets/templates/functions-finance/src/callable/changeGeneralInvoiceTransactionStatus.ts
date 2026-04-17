import type { DocumentReference } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import { HttpsError } from 'firebase-functions/v2/https';

import { extraLog } from 'utils/conditionalLog.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { InvoiceAm as Invoice } from 'models/finance/index.js';

export const changeGeneralInvoiceTransactionStatus = onCallWithPermission<
  { invoiceId: string; code: string; action: string },
  Promise<void>
>(['admin', 'finance'], async ({ data: { invoiceId, code, action }, auth }) => {
  const db = getFirestore();
  const docRef = db.doc(`finance_generalInvoices/${invoiceId}`) as DocumentReference<
    Invoice,
    Invoice
  >;
  const doc = (await docRef.get()).data();

  if (!doc) {
    return;
  }

  const childDoc = doc.transactions.find((value) => value.code === code);

  if (!childDoc) {
    return;
  }

  switch (action) {
    case 'clear':
      childDoc.isCleared = true;
      childDoc.isCancelled = false;
      break;
    case 'cancel':
      childDoc.isCancelled = true;
      break;
    case 'reset':
      if (!auth.token?.admin && !auth.token?.manager) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      childDoc.isCleared = false;
      childDoc.isCancelled = false;
      break;
    default:
      throw new HttpsError('invalid-argument', `action '${action}' not recognized.`);
  }

  await extraLog(
    info,
    '[finance-changeGeneralInvoiceTransactionStatus]',
    `Changing status of transaction "${childDoc.code}" (${childDoc.content}) for general invoice "${doc.code}" (${doc.content}) by action "${action}"...`,
  );

  await docRef.update({
    transactions: doc.transactions,
  });
});
