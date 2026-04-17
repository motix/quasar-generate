import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import docNormalization from 'utils/docNormalization.js';

import type { CustomerAm as Customer } from 'models/finance/index.js';

export const customersNormalization = onDocumentWritten(
  'finance_customers/{id}',
  (event) =>
    !!event.data &&
    docNormalization<Customer>(event.data.before, event.data.after, 'name', 'code', 'name'),
);
