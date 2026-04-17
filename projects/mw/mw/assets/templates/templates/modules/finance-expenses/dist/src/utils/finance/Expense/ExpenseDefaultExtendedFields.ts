import type { Expense, ExpenseExtendedFields, ExpenseVm } from 'models/finance/index.js';

export function expenseDefaultExtendedFields(): Pick<Expense, keyof ExpenseExtendedFields> {
  return {
    // <% if (config.hasModule('finance-expense-groups')) { %>•+ finance-expense-groups
    // •- /finance-expense-groups<% } else { %>•! finance-expense-groups absent<% } %>
  };
}

export function expenseVmDefaultExtendedFields(): Pick<ExpenseVm, keyof ExpenseExtendedFields> {
  return {
    // <% if (config.hasModule('finance-expense-groups')) { %>•+ finance-expense-groups
    group: null,
    // •- /finance-expense-groups<% } else { %>•! finance-expense-groups absent<% } %>
  };
}
