import uniqueField from 'utils/health/uniqueField.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type {
  CustomerAm as Customer,
  FinanceAccountAm as FinanceAccount,
  SalesContractAm as SalesContract,
  SupplierAm as Supplier,
} from 'models/finance/index.js';

export const customersUniqueCode = onCallWithPermission(['admin'], () => {
  return uniqueField<Customer>('finance_customers', 'code');
});

export const customersUniqueName = onCallWithPermission(['admin'], () => {
  return uniqueField<Customer>('finance_customers', 'name');
});

export const suppliersUniqueCode = onCallWithPermission(['admin'], () => {
  return uniqueField<Supplier>('finance_suppliers', 'code');
});

export const suppliersUniqueName = onCallWithPermission(['admin'], () => {
  return uniqueField<Supplier>('finance_suppliers', 'name');
});

export const financeAccountsUniqueName = onCallWithPermission(['admin'], () => {
  return uniqueField<FinanceAccount>('finance_financeAccounts', 'name');
});

export const salesContractsUniqueCode = onCallWithPermission(['admin'], () => {
  return uniqueField<SalesContract>('finance_salesContracts', 'code');
});

export const invoiceGroupsUniqueName = onCallWithPermission(['admin'], () => {
  return uniqueField<Supplier>('finance_invoiceGroups', 'name');
});

export const expenseGroupsUniqueName = onCallWithPermission(['admin'], () => {
  return uniqueField<Supplier>('finance_expenseGroups', 'name');
});
