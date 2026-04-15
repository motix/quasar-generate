declare module 'firebase-admin/auth' {
  interface ManagedRolesToken {
    manager: boolean;
    finance: boolean;
  }
}

export * from './background/customersNormalization.js';
export * from './background/customersUpdater.js';
export * from './background/customersAdapter.js';
export * from './background/suppliersNormalization.js';
export * from './background/suppliersUpdater.js';
export * from './background/financeAccountsNormalization.js';
export * from './background/financeAccountsUpdater.js';

export * from './background/projectsAdapter.js';
export * from './background/projectsUpdater.js';
export * from './background/generalTransactionsUpdater.js';
export * from './background/generalInvoicesUpdater.js';
export * from './background/invoiceGroupsUpdater.js';
export * from './background/generalExpensesUpdater.js';
export * from './background/expenseGroupsUpdater.js';
export * from './background/salesContractsNormalization.js';

export * from './callable/changeQuotationStatus.js';
export * from './callable/changeProjectTransactionStatus.js';
export * from './callable/changeProjectInvoiceStatus.js';
export * from './callable/changeProjectExpenseStatus.js';
export * from './callable/prepareProjectFinanceChannel.js';

export * from './callable/changeGeneralTransactionStatus.js';
export * from './callable/changeGeneralInvoiceStatus.js';
export * from './callable/changeGeneralInvoiceTransactionStatus.js';
export * from './callable/changeGeneralExpenseStatus.js';
export * from './callable/changeGeneralExpenseTransactionStatus.js';
