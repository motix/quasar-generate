import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import docNormalization from 'utils/docNormalization.js';

import type { ProductionRoleAm as ProductionRole } from 'models/production/index.js';

export const productionRolesNormalization = onDocumentWritten(
  'production_productionRoles/{id}',
  (event) =>
    !!event.data &&
    docNormalization<ProductionRole>(event.data.before, event.data.after, 'name', 'name'),
);
