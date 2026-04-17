import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { InvoiceAm as Invoice, InvoiceGroupAm as InvoiceGroup } from 'models/finance/index.js';

// finance_generalInvoices group synced main
export const generalInvoicesGroupSyncedMain = onCallWithPermission(['admin'], () => {
  return liteDocsSyncedMainCollection<Invoice, InvoiceGroup, 'group'>(
    'finance_generalInvoices',
    'finance_invoiceGroups',
    'group',
    ['name'],
  );
});
