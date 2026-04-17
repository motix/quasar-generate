import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import docNormalization from 'utils/docNormalization.js';

import type { SupplierAm as Supplier } from 'models/finance/index.js';

export const suppliersNormalization = onDocumentWritten(
  'finance_suppliers/{id}',
  (event) =>
    !!event.data &&
    docNormalization<Supplier>(event.data.before, event.data.after, 'name', 'code', 'name'),
);
