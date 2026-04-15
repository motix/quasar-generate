import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { ExpenseAm as Expense, SupplierAm as Supplier } from 'models/finance/index.js';

// finance_generalExpenses supplier synced main
export const generalExpensesSupplierSyncedMain = onCallWithPermission(['admin'], () => {
  return liteDocsSyncedMainCollection<Expense, Supplier, 'supplier'>(
    'finance_generalExpenses',
    'finance_suppliers',
    'supplier',
    ['code', 'name'],
  );
});
