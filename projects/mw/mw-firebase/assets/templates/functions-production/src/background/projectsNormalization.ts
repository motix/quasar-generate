import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import docNormalization from 'utils/docNormalization.js';

import type { ProjectAm as Project } from 'models/production/index.js';

export const projectsNormalization = onDocumentWritten(
  'production_projects/{id}',
  (event) =>
    !!event.data && docNormalization<Project>(event.data.before, event.data.after, 'name', 'name'),
);
