// Already done. Do not run again.

import { info } from 'firebase-functions/logger';

import { collectionForeach } from 'utils/queryForeach.js';

import type { ProjectAm as Project } from 'models/finance/projects.js';

export default async function updateProjectsInvoiceGroupIdsExpenseGroupIds() {
  await collectionForeach<Project, Project>('finance_projects', async (docSnapshot) => {
    const project = docSnapshot.data();

    project.invoiceGroupIds = [];
    project.expenseGroupIds = [];

    info('[updateProjectsInvoiceGroupIdsExpenseGroupIds]', `Updating project "${project.name}"...`);

    await docSnapshot.ref.update({
      invoiceGroupIds: project.invoiceGroupIds,
      expenseGroupIds: project.expenseGroupIds,
    });
  });
}
