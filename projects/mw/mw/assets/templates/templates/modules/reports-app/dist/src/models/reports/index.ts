export interface MonthlyReport<T> {
  year: number;
  month: number;
  content: T;
}

export interface YearlyReport<T> {
  year: number;
  content: T;
}

export interface AllYearsReport<T> {
  years: {
    year: number;
    content: T;
  }[];
}

export interface RangeReport<T> {
  startDate: Date;
  endDate: Date;
  content: T;
}

// <% if (config.hasModule('reports-customers')) { %>•+ reports-customers
export * from 'models/reports/customers.js';
// •- /reports-customers<% } else { %>•! reports-customers absent<% } %>

// <% if (config.hasModule('reports-suppliers')) { %>•+ reports-suppliers
export * from 'models/reports/suppliers.js';
// •- /reports-suppliers<% } else { %>•! reports-suppliers absent<% } %>

// <% if (config.hasModule('reports-finance-accounts')) { %>•+ reports-finance-accounts
export * from 'models/reports/finance-accounts.js';
// •- /reports-finance-accounts<% } else { %>•! reports-finance-accounts absent<% } %>

// <% if (config.hasModule('reports-projects')) { %>•+ reports-projects
export * from 'models/reports/projects.js';
// •- /reports-projects<% } else { %>•! reports-projects absent<% } %>

// <% if (config.hasModule('reports-invoices')) { %>•+ reports-invoices
export * from 'models/reports/invoices.js';
// •- /reports-invoices<% } else { %>•! reports-invoices absent<% } %>

// <% if (config.hasModule('reports-expenses')) { %>•+ reports-expenses
export * from 'models/reports/expenses.js';
// •- /reports-expenses<% } else { %>•! reports-expenses absent<% } %>

// <% if (config.hasModule('reports-finance-details')) { %>•+ reports-finance-details
export * from 'models/reports/finance-details.js';
// •- /reports-finance-details<% } else { %>•! reports-finance-details absent<% } %>

// <% if (config.hasModule('reports-receivable')) { %>•+ reports-receivable
export * from 'models/reports/receivable.js';
// •- /reports-receivable<% } else { %>•! reports-receivable absent<% } %>

// <% if (config.hasModule('reports-payable')) { %>•+ reports-payable
export * from 'models/reports/payable.js';
// •- /reports-payable<% } else { %>•! reports-payable absent<% } %>

// <% if (config.hasModule('reports-sales-vat-invoices')) { %>•+ reports-sales-vat-invoices
export * from 'models/reports/sales-vat-invoices.js';
// •- /reports-sales-vat-invoices<% } else { %>•! reports-sales-vat-invoices absent<% } %>
