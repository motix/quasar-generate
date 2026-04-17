import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import docNormalization from 'utils/docNormalization.js';

import type { FinanceAccountAm as FinanceAccount } from 'models/finance/index.js';

export const financeAccountsNormalization = onDocumentWritten(
  'finance_financeAccounts/{id}',
  (event) =>
    !!event.data &&
    docNormalization<FinanceAccount>(event.data.before, event.data.after, 'name', 'name'),
);
