import type { DocumentSnapshot } from 'firebase-admin/firestore';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import adapterBackwardUpdate from 'utils/adapterBackwardUpdate.js';

import type { ProjectAm as FinanceProject } from 'models/finance/index.js';
import type { ProjectAm as ProductionProject } from 'models/production/index.js';

export const projectsAdapter = onDocumentWritten('finance_projects/{id}', async (event) => {
  if (!event.data) {
    return;
  }

  const projectChange = event.data as Change<DocumentSnapshot<FinanceProject>>;
  const id = event.params.id;

  // Finance to Production

  await adapterBackwardUpdate<FinanceProject, ProductionProject>(
    projectChange.after,
    id,
    'production_projects',
    async (source) => {
      return Promise.resolve({
        isArchived: source.isArchived,
      });
    },
    'name',
  );
});
