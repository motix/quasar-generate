import type { CollectionReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import clearReportsCache from 'utils/clearReportsCache.js';
import { collectionForeach } from 'utils/queryForeach.js';
import { updateProjectFinanceChannel } from 'utils/slack.js';

import type {
  ProjectAm as Project,
  SalesContractAm as SalesContract,
  TransactionAm as Transaction,
} from 'models/finance/index.js';

export const projectsUpdater = onDocumentWritten('finance_projects/{id}', async (event) => {
  if (!event.data) {
    return;
  }

  const projectChange = event.data as Change<DocumentSnapshot<Project>>;
  const beforeOrAfterProject =
    projectChange.before.data() ||
    projectChange.after.data() ||
    (() => {
      throw new Error('Both before and after data do not exist.'); // There's no scenario where this happens.
    })();

  const transactionsMetaDataCollectionPath = `finance_projects/${projectChange.after.id}/transactionsMetaData`;

  info(
    '[finance-projectsUpdater]',
    `Deleting all transaction meta data for project "${beforeOrAfterProject.name}" at "${transactionsMetaDataCollectionPath}"...`,
  );

  await collectionForeach(transactionsMetaDataCollectionPath, async (docSnapshot) => {
    await docSnapshot.ref.delete();
  });

  const db = getFirestore();

  if (!projectChange.after.exists) {
    // Clear Reports cache

    await clearReportsCache();

    // Update sales_contract

    const project = projectChange.before.data()!;

    const contractsRef = db.collection(
      'finance_salesContracts',
    ) as CollectionReference<SalesContract>;
    const contractsSnapshot = await contractsRef
      .where('projectIds', 'array-contains', projectChange.before.id)
      .get();

    info(
      '[finance-projectsUpdater]',
      `Found ${contractsSnapshot.size} sales contracts for DELETED project "${project.name}".`,
    );

    for (const snapshot of contractsSnapshot.docs) {
      const contract = snapshot.data();

      info('[finance-projectsUpdater]', `Updating contract "${contract.code}"...`);

      await snapshot.ref.set(
        {
          projectIds: contract.projectIds.filter((value) => value !== projectChange.before.id),
          notes: `${contract.notes?.startsWith('!') ? '' : '! '}${contract.notes}${contract.notes ? ' ' : ''}Project "${project.name}" deleted.`,
        },
        { merge: true },
      );
    }

    info(
      '[finance-projectsUpdater]',
      `Updated ${contractsSnapshot.size} sales contracts for DELETED project "${project.name}".`,
    );

    return;
  }

  // Update finance_projects/{id}/transactionsMetaData

  const transactionsMetaDataRef = db.collection(
    transactionsMetaDataCollectionPath,
  ) as CollectionReference<{
    issueDate: Transaction['issueDate'];
    financeAccountIds: string[];
  }>;

  const project = projectChange.after.data()!;
  const metaDataRecords = [
    ...project.quotations.flatMap((quotation) =>
      (quotation.invoice?.transactions || []).map((transaction) => ({
        issueDate: transaction.issueDate,
        customerId: project.customer.id,
        financeAccountIds: [
          ...(transaction.sourceFinanceAccount ? [transaction.sourceFinanceAccount.id] : []),
          ...(transaction.destinationFinanceAccount
            ? [transaction.destinationFinanceAccount.id]
            : []),
        ],
      })),
    ),
    ...project.expenses.flatMap((expense) =>
      expense.transactions.map((transaction) => ({
        issueDate: transaction.issueDate,
        supplierId: expense.supplier.id,
        financeAccountIds: [
          ...(transaction.sourceFinanceAccount ? [transaction.sourceFinanceAccount.id] : []),
          ...(transaction.destinationFinanceAccount
            ? [transaction.destinationFinanceAccount.id]
            : []),
        ],
      })),
    ),
  ];

  info(
    '[finance-projectsUpdater]',
    `Adding ${metaDataRecords.length} transaction meta data records for project "${project.name}" at "${transactionsMetaDataCollectionPath}".`,
  );

  for (const record of metaDataRecords) {
    await transactionsMetaDataRef.add(record);
  }

  // Clear Reports cache

  await clearReportsCache();

  // Update Slack channel

  if (projectChange.before.exists) {
    if (
      projectChange.after.data()!.urlFriendlyName !==
        projectChange.before.data()!.urlFriendlyName ||
      projectChange.after.data()!.name !== projectChange.before.data()!.name
    ) {
      info(
        '[finance-projectsUpdater]',
        `Updating Slack finance channel for project "${project.name}"...`,
      );

      await updateProjectFinanceChannel(projectChange.before.data()!, projectChange.after.data()!);
    }
  }
});
