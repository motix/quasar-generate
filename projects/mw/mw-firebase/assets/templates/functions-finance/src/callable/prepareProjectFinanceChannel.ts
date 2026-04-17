import type { DocumentReference } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';

import { extraLog } from 'utils/conditionalLog.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';
import { createProjectFinanceChannelIfNotExist } from 'utils/slack.js';

import type { ProjectAm as Project } from 'models/finance/index.js';

export const prepareProjectFinanceChannel = onCallWithPermission<
  { projectId: string },
  Promise<void>
>(['admin', 'finance'], async ({ data: { projectId } }) => {
  const db = getFirestore();
  const docRef = db.doc(`finance_projects/${projectId}`) as DocumentReference<Project>;
  const doc = (await docRef.get()).data();

  if (!doc) {
    return;
  }

  await extraLog(
    info,
    '[finance-prepareProjectFinanceChannel]',
    `Preparing Slack finance channel for project "${doc.name}" if not exist...`,
  );

  await createProjectFinanceChannelIfNotExist(doc, true);
});
