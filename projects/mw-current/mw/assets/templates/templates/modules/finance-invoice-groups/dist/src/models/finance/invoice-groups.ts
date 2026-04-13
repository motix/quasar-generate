import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';

// Models

export interface InvoiceGroup extends DocModel {
  isActive: boolean;
  name: string;
  description?: string;
}

export interface InvoiceGroupLite {
  id: string;
  name: string;
}

declare module 'models/finance/invoices.js' {
  interface InvoiceExtendedFields {
    group: never;
  }

  interface Invoice {
    // Map
    group?: InvoiceGroupLite;
  }
}

// View Models

export interface InvoiceGroupVm extends Omit<DocViewModel<InvoiceGroup>, 'description'> {
  description: string | null;
}

declare module 'models/finance/invoices.js' {
  interface InvoiceVm {
    // Map
    group: InvoiceGroupLite | null;
  }
}

// API Models

export interface InvoiceGroupAm extends Omit<DocApiModel<InvoiceGroup>, 'description'> {
  description?: string | null;
}

declare module 'models/finance/invoices.js' {
  interface InvoiceAm {
    // Map
    group?: InvoiceGroupLite | null;
  }
}
