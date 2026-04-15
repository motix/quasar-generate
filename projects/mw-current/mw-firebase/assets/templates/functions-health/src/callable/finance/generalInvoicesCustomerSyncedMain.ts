import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { CustomerAm as Customer, InvoiceAm as Invoice } from 'models/finance/index.js';

// finance_generalInvoices customer synced main
export const generalInvoicesCustomerSyncedMain = onCallWithPermission(['admin'], () => {
  return liteDocsSyncedMainCollection<Invoice, Customer, 'customer'>(
    'finance_generalInvoices',
    'finance_customers',
    'customer',
    ['code', 'name'],
  );
});
