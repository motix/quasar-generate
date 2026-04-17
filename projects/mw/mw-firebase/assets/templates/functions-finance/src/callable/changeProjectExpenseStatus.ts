import type { DocumentReference } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import { HttpsError } from 'firebase-functions/v2/https';

import { extraLog } from 'utils/conditionalLog.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { ProjectAm as Project } from 'models/finance/index.js';

export const changeProjectExpenseStatus = onCallWithPermission<
  { projectId: string; code: string; action: string },
  Promise<void>
>(['admin', 'finance'], async ({ data: { projectId, code, action }, auth }) => {
  const db = getFirestore();
  const docRef = db.doc(`finance_projects/${projectId}`) as DocumentReference<Project, Project>;
  const doc = (await docRef.get()).data();

  if (!doc) {
    return;
  }

  const childDoc = doc.expenses.find((value) => value.code === code);

  if (!childDoc) {
    return;
  }

  switch (action) {
    case 'complete':
      childDoc.isCompleted = true;
      childDoc.isApproved = false;
      childDoc.isCancelled = false;
      break;
    case 'approve':
      if (!auth.token?.admin && !auth.token?.manager) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      childDoc.isCompleted = true;
      childDoc.isApproved = true;
      childDoc.isCancelled = false;
      break;
    case 'reject':
      if (!auth.token?.admin && !auth.token?.manager) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      childDoc.isCompleted = false;
      childDoc.isApproved = false;
      childDoc.isRejected = true;
      childDoc.isCancelled = false;
      break;
    case 'cancel':
      childDoc.isCancelled = true;
      break;
    case 'reset':
      if (!auth.token?.admin && !auth.token?.manager) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      childDoc.isCompleted = false;
      childDoc.isApproved = false;
      childDoc.isRejected = false;
      childDoc.isCancelled = false;
      break;
    default:
      throw new HttpsError('invalid-argument', `action '${action}' not recognized.`);
  }

  await extraLog(
    info,
    '[finance-changeProjectExpenseStatus]',
    `Changing status of expense "${childDoc.code}" (${childDoc.content}) of project "${doc.name}" by action "${action}"...`,
  );

  await docRef.update({
    expenses: doc.expenses,
  });
});
