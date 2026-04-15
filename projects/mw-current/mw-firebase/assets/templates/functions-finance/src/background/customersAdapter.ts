import type { DocumentSnapshot } from 'firebase-admin/firestore';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import adapterUpdate from 'utils/adapterUpdate.js';

import type { CustomerAm as FinanceCustomer } from 'models/finance/index.js';
import type { CustomerAm as ProductionCustomer } from 'models/production/index.js';

export const customersAdapter = onDocumentWritten('finance_customers/{id}', async (event) => {
  if (!event.data) {
    return;
  }

  const customerChange = event.data as Change<DocumentSnapshot<FinanceCustomer>>;
  const id = event.params.id;

  // Finance to Production

  await adapterUpdate<FinanceCustomer, ProductionCustomer, never>(
    customerChange.after,
    id,
    'production_customers',
    (source) =>
      Promise.resolve({
        isActive: source.isActive,
        code: source.code,
        name: source.name,
      }),
    (intersection) => intersection,
    'name',
  );
});
