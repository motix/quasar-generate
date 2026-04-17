import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import docNormalization from 'utils/docNormalization.js';

import type { ProductTypeAm as ProductType } from 'models/production/index.js';

export const productTypesNormalization = onDocumentWritten(
  'production_productTypes/{id}',
  (event) =>
    !!event.data &&
    docNormalization<ProductType>(event.data.before, event.data.after, 'name', 'name'),
);
