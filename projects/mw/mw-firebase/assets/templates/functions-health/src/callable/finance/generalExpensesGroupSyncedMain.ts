import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { ExpenseAm as Expense, ExpenseGroupAm as ExpenseGroup } from 'models/finance/index.js';

// finance_generalExpenses group synced main
export const generalExpensesGroupSyncedMain = onCallWithPermission(['admin'], () => {
  return liteDocsSyncedMainCollection<Expense, ExpenseGroup, 'group'>(
    'finance_generalExpenses',
    'finance_expenseGroups',
    'group',
    ['name'],
  );
});
