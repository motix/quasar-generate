import type { Invoice, InvoiceExtendedFields, InvoiceVm } from 'models/finance/index.js';

export function invoiceDefaultExtendedFields(): Pick<Invoice, keyof InvoiceExtendedFields> {
  return {
    // <% if (config.hasModule('finance-invoice-groups')) { %>•+ finance-invoice-groups
    // •- /finance-invoice-groups<% } else { %>•! finance-invoice-groups absent<% } %>
  };
}

export function invoiceVmDefaultExtendedFields(): Pick<InvoiceVm, keyof InvoiceExtendedFields> {
  return {
    // <% if (config.hasModule('finance-invoice-groups')) { %>•+ finance-invoice-groups
    group: null,
    // •- /finance-invoice-groups<% } else { %>•! finance-invoice-groups absent<% } %>
  };
}
