// sort-imports-ignore

import type { MappingProfile } from '@automapper/core';

import { addProfile, createMapper } from '@automapper/core';
import { pojos } from '@automapper/pojos';

// <% if (config.hasModule('finance-customers')) { %>•+ finance-customers
import customerProfile from 'models/finance/mapper/customerProfile.js';
// •- /finance-customers<% } else { %>•! finance-customers absent<% } %>

// <% if (config.hasModule('finance-suppliers')) { %>•+ finance-suppliers
import supplierProfile from 'models/finance/mapper/supplierProfile.js';
// •- /finance-suppliers<% } else { %>•! finance-suppliers absent<% } %>

// <% if (config.hasModule('finance-finance-accounts')) { %>•+ finance-finance-accounts
import financeAccountProfile from 'models/finance/mapper/financeAccountProfile.js';
import balanceRecordProfile from 'models/finance/mapper/balanceRecordProfile.js';
// •- /finance-finance-accounts<% } else { %>•! finance-finance-accounts absent<% } %>

// <% if (config.hasModule('finance-projects')) { %>•+ finance-projects
import projectProfile from 'models/finance/mapper/projectProfile.js';
import itemProfile from 'models/finance/mapper/itemProfile.js';
// •- /finance-projects<% } else { %>•! finance-projects absent<% } %>

// <% if (config.hasModule('finance-quotations')) { %>•+ finance-quotations
import projectProfile_Quotations from 'models/finance/mapper/projectProfile_Quotations.js';
import quotationProfile from 'models/finance/mapper/quotationProfile.js';
import quotationDetailProfile from 'models/finance/mapper/quotationDetailProfile.js';
// •- /finance-quotations<% } else { %>•! finance-quotations absent<% } %>

// <% if (config.hasModule('finance-transactions')) { %>•+ finance-transactions
import transactionProfile from 'models/finance/mapper/transactionProfile.js';
import transactionDetailProfile from 'models/finance/mapper/transactionDetailProfile.js';
// •- /finance-transactions<% } else { %>•! finance-transactions absent<% } %>

// <% if (config.hasModule('finance-invoices')) { %>•+ finance-invoices
import invoiceProfile from 'models/finance/mapper/invoiceProfile.js';
import invoiceDetailProfile from 'models/finance/mapper/invoiceDetailProfile.js';
// •- /finance-invoices<% } else { %>•! finance-invoices absent<% } %>

// <% if (config.hasModule('finance-invoice-groups')) { %>•+ finance-invoice-groups
import invoiceGroupProfile from 'models/finance/mapper/invoiceGroupProfile.js';
import invoiceProfile_InvoiceGroups from 'models/finance/mapper/invoiceProfile_InvoiceGroups.js';
// •- /finance-invoice-groups<% } else { %>•! finance-invoice-groups absent<% } %>

// <% if (config.hasModule('finance-expenses')) { %>•+ finance-expenses
import expenseProfile from 'models/finance/mapper/expenseProfile.js';
import expenseDetailProfile from 'models/finance/mapper/expenseDetailProfile.js';
// •- /finance-expenses<% } else { %>•! finance-expenses absent<% } %>

// <% if (config.hasModule('finance-expense-groups')) { %>•+ finance-expense-groups
import expenseGroupProfile from 'models/finance/mapper/expenseGroupProfile.js';
import expenseProfile_ExpenseGroups from 'models/finance/mapper/expenseProfile_ExpenseGroups.js';
// •- /finance-expense-groups<% } else { %>•! finance-expense-groups absent<% } %>

// <% if (config.hasModule('finance-project-invoices')) { %>•+ finance-project-invoices
import projectProfile_ProjectInvoices from 'models/finance/mapper/projectProfile_ProjectInvoices.js';
import quotationProfile_ProjectInvoices from 'models/finance/mapper/quotationProfile_ProjectInvoices.js';
// •- /finance-project-invoices<% } else { %>•! finance-project-invoices absent<% } %>

// <% if (config.hasModule('finance-project-invoice-groups')) { %>•+ finance-project-invoice-groups
import projectProfile_ProjectInvoiceGroups from 'models/finance/mapper/projectProfile_ProjectInvoiceGroups.js';
// •- /finance-project-invoice-groups<% } else { %>•! finance-project-invoice-groups absent<% } %>

// <% if (config.hasModule('finance-project-expenses')) { %>•+ finance-project-expenses
import projectProfile_ProjectExpenses from 'models/finance/mapper/projectProfile_ProjectExpenses.js';
// •- /finance-project-expenses<% } else { %>•! finance-project-expenses absent<% } %>

// <% if (config.hasModule('finance-project-expense-groups')) { %>•+ finance-project-expense-groups
import projectProfile_ProjectExpenseGroups from 'models/finance/mapper/projectProfile_ProjectExpenseGroups.js';
// •- /finance-project-expense-groups<% } else { %>•! finance-project-expense-groups absent<% } %>

// <% if (config.hasModule('finance-sales-contracts')) { %>•+ finance-sales-contracts
import salesContractProfile from 'models/finance/mapper/salesContractProfile.js';
import vatInvoiceProfile from 'models/finance/mapper/vatInvoiceProfile.js';
// •- /finance-sales-contracts<% } else { %>•! finance-sales-contracts absent<% } %>

// <% if (config.hasModule('finance-project-messages')) { %>•+ finance-project-messages
import rawSlackMessageProfile from 'models/finance/mapper/rawSlackMessageProfile.js';
import projectProfile_ProjectMessages from 'models/finance/mapper/projectProfile_ProjectMessages.js';
// •- /finance-project-messages<% } else { %>•! finance-project-messages absent<% } %>

// <% if (config.hasModule('finance-team')) { %>•+ finance-team
import memberProfile from 'models/finance/mapper/memberProfile.js';
// •- /finance-team<% } else { %>•! finance-team absent<% } %>

// <% if (config.hasModule('shared-tasks')) { %>•+ shared-tasks
import taskFolderProfile from 'models/tasks/mapper/taskFolderProfile.js';
import taskProfile from 'models/tasks/mapper/taskProfile.js';
import taskCommentProfile from 'models/tasks/mapper/taskCommentProfile.js';
// •- /shared-tasks<% } else { %>•! shared-tasks absent<% } %>

// <% if (config.hasModule('finance-todos')) { %>•+ finance-todos
import todoProfile from 'models/finance/mapper/todoProfile.js';
// •- /finance-todos<% } else { %>•! finance-todos absent<% } %>

// <% if (config.hasModule('finance-project-tasks')) { %>•+ finance-project-tasks
import projectProfile_ProjectTasks from 'models/finance/mapper/projectProfile_ProjectTasks.js';
// •- /finance-project-tasks<% } else { %>•! finance-project-tasks absent<% } %>

export const financeProfile: MappingProfile = (
  /* <% if (
    config.hasModule('finance-customers') ||
    config.hasModule('finance-suppliers') ||
    config.hasModule('finance-finance-accounts') ||
    config.hasModule('finance-team') ||
    config.hasModule('shared-tasks')
  ) { %>•+ At least 1 presents */
  mapper,
  /* •- /At least 1 presents<% } else { %>•! All absent<% } %> */
) => {
  // <% if (config.hasModule('finance-customers')) { %>•+ finance-customers
  customerProfile(mapper);
  // •- /finance-customers<% } else { %>•! finance-customers absent<% } %>

  // <% if (config.hasModule('finance-suppliers')) { %>•+ finance-suppliers
  supplierProfile(mapper);
  // •- /finance-suppliers<% } else { %>•! finance-suppliers absent<% } %>

  // <% if (config.hasModule('finance-finance-accounts')) { %>•+ finance-finance-accounts
  financeAccountProfile(mapper);
  balanceRecordProfile(mapper);
  // •- /finance-finance-accounts<% } else { %>•! finance-finance-accounts absent<% } %>

  // <% if (config.hasModule('finance-projects')) { %>•+ finance-projects
  projectProfile(mapper);
  itemProfile(mapper);
  // •- /finance-projects<% } else { %>•! finance-projects absent<% } %>

  // <% if (config.hasModule('finance-quotations')) { %>•+ finance-quotations
  projectProfile_Quotations(mapper);
  quotationProfile(mapper);
  quotationDetailProfile(mapper);
  // •- /finance-quotations<% } else { %>•! finance-quotations absent<% } %>

  // <% if (config.hasModule('finance-transactions')) { %>•+ finance-transactions
  transactionProfile(mapper);
  transactionDetailProfile(mapper);
  // •- /finance-transactions<% } else { %>•! finance-transactions absent<% } %>

  // <% if (config.hasModule('finance-invoices')) { %>•+ finance-invoices
  invoiceProfile(mapper);
  invoiceDetailProfile(mapper);
  // •- /finance-invoices<% } else { %>•! finance-invoices absent<% } %>

  // <% if (config.hasModule('finance-invoice-groups')) { %>•+ finance-invoice-groups
  invoiceGroupProfile(mapper);
  invoiceProfile_InvoiceGroups(mapper);
  // •- /finance-invoice-groups<% } else { %>•! finance-invoice-groups absent<% } %>

  // <% if (config.hasModule('finance-expenses')) { %>•+ finance-expenses
  expenseProfile(mapper);
  expenseDetailProfile(mapper);
  // •- /finance-expenses<% } else { %>•! finance-expenses absent<% } %>

  // <% if (config.hasModule('finance-expense-groups')) { %>•+ finance-expense-groups
  expenseGroupProfile(mapper);
  expenseProfile_ExpenseGroups(mapper);
  // •- /finance-expense-groups<% } else { %>•! finance-expense-groups absent<% } %>

  // <% if (config.hasModule('finance-project-invoices')) { %>•+ finance-project-invoices
  projectProfile_ProjectInvoices(mapper);
  quotationProfile_ProjectInvoices(mapper);
  // •- /finance-project-invoices<% } else { %>•! finance-project-invoices absent<% } %>

  // <% if (config.hasModule('finance-project-invoice-groups')) { %>•+ finance-project-invoice-groups
  projectProfile_ProjectInvoiceGroups(mapper);
  // •- /finance-project-invoice-groups<% } else { %>•! finance-project-invoice-groups absent<% } %>

  // <% if (config.hasModule('finance-project-expenses')) { %>•+ finance-project-expenses
  projectProfile_ProjectExpenses(mapper);
  // •- /finance-project-expenses<% } else { %>•! finance-project-expenses absent<% } %>

  // <% if (config.hasModule('finance-project-expense-groups')) { %>•+ finance-project-expense-groups
  projectProfile_ProjectExpenseGroups(mapper);
  // •- /finance-project-expense-groups<% } else { %>•! finance-project-expense-groups absent<% } %>

  // <% if (config.hasModule('finance-sales-contracts')) { %>•+ finance-sales-contracts
  salesContractProfile(mapper);
  vatInvoiceProfile(mapper);
  // •- /finance-sales-contracts<% } else { %>•! finance-sales-contracts absent<% } %>

  // <% if (config.hasModule('finance-project-messages')) { %>•+ finance-project-messages
  rawSlackMessageProfile(mapper);
  projectProfile_ProjectMessages(mapper);
  // •- /finance-project-messages<% } else { %>•! finance-project-messages absent<% } %>

  // <% if (config.hasModule('finance-team')) { %>•+ finance-team
  memberProfile(mapper);
  // •- /finance-team<% } else { %>•! finance-team absent<% } %>

  // <% if (config.hasModule('shared-tasks')) { %>•+ shared-tasks
  taskFolderProfile(mapper);
  taskProfile(mapper);
  taskCommentProfile(mapper);
  // •- /shared-tasks<% } else { %>•! shared-tasks absent<% } %>

  // <% if (config.hasModule('finance-todos')) { %>•+ finance-todos
  todoProfile(mapper);
  // •- /finance-todos<% } else { %>•! finance-todos absent<% } %>

  // <% if (config.hasModule('finance-project-tasks')) { %>•+ finance-project-tasks
  projectProfile_ProjectTasks(mapper);
  // •- /finance-project-tasks<% } else { %>•! finance-project-tasks absent<% } %>
};

const financeMapper = createMapper({
  strategyInitializer: pojos(),
});

addProfile(financeMapper, financeProfile);

export default financeMapper;
