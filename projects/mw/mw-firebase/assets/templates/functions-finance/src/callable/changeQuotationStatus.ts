import type { DocumentReference } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import { HttpsError } from 'firebase-functions/v2/https';

import { extraLog } from 'utils/conditionalLog.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { ProjectAm as Project } from 'models/finance/index.js';

export const changeQuotationStatus = onCallWithPermission<
  { projectId: string; code: string; action: string },
  Promise<void>
>(['admin', 'finance'], async ({ data: { projectId, code, action }, auth }) => {
  const db = getFirestore();
  const docRef = db.doc(`finance_projects/${projectId}`) as DocumentReference<Project, Project>;
  const doc = (await docRef.get()).data();

  if (!doc) {
    return;
  }

  const childDoc = doc.quotations.find((value) => value.code === code);

  if (!childDoc) {
    return;
  }

  switch (action) {
    case 'approve':
      if (!auth.token?.admin && !auth.token?.manager) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      childDoc.isApproved = true;
      childDoc.isSentToCustomer = false;
      childDoc.isConfirmed = false;
      childDoc.isCancelled = false;
      break;
    case 'sendToCustomer':
      if (!childDoc.isApproved) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      childDoc.isSentToCustomer = true;
      childDoc.isConfirmed = false;
      childDoc.isCancelled = false;
      break;
    case 'confirm':
      if (!childDoc.isApproved) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      childDoc.isSentToCustomer = true;
      childDoc.isConfirmed = true;
      childDoc.isCancelled = false;
      break;
    case 'cancel':
      if (childDoc.invoice) {
        childDoc.invoice.isCancelled = true;
      }

      childDoc.isCancelled = true;
      break;
    case 'reset':
      if (!auth.token?.admin && !auth.token?.manager) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      doc.quotations.forEach((value) => {
        if (value !== childDoc) {
          value.isCancelled = true;

          if (value.invoice) {
            value.invoice.isCancelled = true;
          }
        }
      });

      childDoc.isApproved = false;
      childDoc.isSentToCustomer = false;
      childDoc.isConfirmed = false;
      childDoc.isCancelled = false;
      break;
    default:
      throw new HttpsError('invalid-argument', `action '${action}' not recognized.`);
  }

  await extraLog(
    info,
    '[finance-changeQuotationStatus]',
    `Changing status of quotation "${childDoc.code}" for project "${doc.name}" by action "${action}"...`,
  );

  await docRef.update({
    quotations: doc.quotations,
  });
});
