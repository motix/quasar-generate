import type { Invoice, InvoiceAm, InvoiceVm } from 'models/finance/index.js';

// Models

declare module 'models/finance/quotations.js' {
  interface QuotationExtendedFields {
    invoice: never;
  }

  interface Quotation {
    // Map
    invoice?: Invoice | undefined; // Allow undefined while editing
  }
}

// View Models

declare module 'models/finance/quotations.js' {
  interface QuotationVm {
    // Map
    invoice?: InvoiceVm | null;
  }
}

// API Models

declare module 'models/finance/quotations.js' {
  interface QuotationAm {
    // Map
    invoice?: InvoiceAm | null;
  }
}
