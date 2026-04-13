import { httpsCallable } from 'firebase/functions';

import type { HealthCheckResult } from 'models/health/index.js';

import { getFunctions } from 'services/firebase.js';

export type HealthCheckMethod =
  // Admin
  | 'healthAdmin-userAccountsSyncedFirebaseAuth'
  | 'healthAdmin-membersUniqueUid'
  | 'healthAdmin-membersUniqueEmail'
  | 'healthAdmin-membersSyncedAdminUserAccounts'
  // HR
  | 'healthHr-membersSyncedAdminMembers'
  | 'healthHr-projectsSyncedProductionProjects'
  | 'healthHr-payrollsUniqueCode'
  // Production
  | 'healthProduction-membersSyncedAdminMembers'
  | 'healthProduction-membersDprSyncedMain'
  | 'healthProduction-productionRolesUniqueName'
  | 'healthProduction-productTypesUniqueName'
  | 'healthProduction-productionSalaryDetailsUniqueProductionRole'
  | 'healthProduction-productionSalaryDetailsPrSyncedMain'
  | 'healthProduction-customersSyncedFinanceCustomers'
  | 'healthProduction-projectsUniqueName'
  | 'healthProduction-projectsUniqueUrlFriendlyName'
  | 'healthProduction-projectsOwnerSyncedMain'
  | 'healthProduction-projectsCustomerSyncedMain'
  | 'healthProduction-projectsIptSyncedMain'
  | 'healthProduction-projectsIcmSyncedMain'
  | 'healthProduction-projectsIcprSyncedMain'
  // Finance
  | 'healthFinance-customersUniqueCode'
  | 'healthFinance-customersUniqueName'
  | 'healthFinance-suppliersUniqueCode'
  | 'healthFinance-suppliersUniqueName'
  | 'healthFinance-financeAccountsUniqueName'
  | 'healthFinance-invoiceGroupsUniqueName'
  | 'healthFinance-expenseGroupsUniqueName'
  | 'healthFinance-projectsSyncedProductionProjects'
  | 'healthFinance-projectsIeSyncedProject'
  | 'healthFinance-projectsEsSyncedMain'
  | 'healthFinance-projectsTfasSyncedMain'
  | 'healthFinance-generalInvoicesCustomerSyncedMain'
  | 'healthFinance-generalInvoicesGroupSyncedMain'
  | 'healthFinance-generalInvoicesTfasSyncedMain'
  | 'healthFinance-generalExpensesSupplierSyncedMain'
  | 'healthFinance-generalExpensesGroupSyncedMain'
  | 'healthFinance-generalExpensesTfasSyncedMain'
  | 'healthFinance-generalTransactionsFasSyncedMain'
  | 'healthFinance-salesContractsCustomerSyncedMain'
  | 'healthFinance-salesContractsProjectsSyncedMain'
  | 'healthFinance-salesContractsGisSyncedMain'
  | 'healthFinance-invoicesUniqueCode'
  | 'healthFinance-expensesUniqueCode'
  | 'healthFinance-transactionsUniqueCode'
  | 'healthFinance-salesContractsUniqueCode';

export async function healthCheck(method: HealthCheckMethod) {
  const functions = getFunctions();
  const callable = httpsCallable<undefined, HealthCheckResult>(functions, method);

  try {
    const result = await callable();
    const data = result.data;
    return data;
  } catch (error) {
    throw new Error(`Calling to ${method} failed.`, { cause: error });
  }
}
