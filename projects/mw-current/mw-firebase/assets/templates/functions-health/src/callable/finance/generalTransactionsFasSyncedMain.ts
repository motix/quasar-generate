import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type {
  FinanceAccountAm as FinanceAccount,
  TransactionAm as Transaction,
} from 'models/finance/index.js';
import type { HealthCheckResult } from 'models/health/index.js';

// finance_generalTransactions finance accounts synced main
export const generalTransactionsFasSyncedMain = onCallWithPermission(['admin'], async () => {
  const sourceFinanceAccountResult = await liteDocsSyncedMainCollection<
    Transaction,
    FinanceAccount,
    'sourceFinanceAccount'
  >('finance_generalTransactions', 'finance_financeAccounts', 'sourceFinanceAccount', ['name']);

  const destinationFinanceAccountResult = await liteDocsSyncedMainCollection<
    Transaction,
    FinanceAccount,
    'destinationFinanceAccount'
  >('finance_generalTransactions', 'finance_financeAccounts', 'destinationFinanceAccount', [
    'name',
  ]);

  const result: HealthCheckResult = {
    successes: [
      ...sourceFinanceAccountResult.successes,
      ...destinationFinanceAccountResult.successes,
    ],
    errors: [...sourceFinanceAccountResult.errors, ...destinationFinanceAccountResult.errors],
    info: [
      ...new Set([...sourceFinanceAccountResult.info, ...destinationFinanceAccountResult.info]),
    ],
  };

  return result;
});
