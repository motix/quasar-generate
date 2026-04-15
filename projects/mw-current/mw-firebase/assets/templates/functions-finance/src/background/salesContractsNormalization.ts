import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import docNormalization from 'utils/docNormalization.js';

import type { SalesContractAm as SalesContract } from 'models/finance/index.js';

export const salesContractsNormalization = onDocumentWritten(
  'finance_salesContracts/{id}',
  (event) =>
    !!event.data &&
    docNormalization<SalesContract>(event.data.before, event.data.after, 'code', 'code'),
);
