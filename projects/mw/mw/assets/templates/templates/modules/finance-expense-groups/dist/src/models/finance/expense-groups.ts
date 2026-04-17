import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';

// Models

export interface ExpenseGroup extends DocModel {
  isActive: boolean;
  name: string;
  description?: string;
}

export interface ExpenseGroupLite {
  id: string;
  name: string;
}

declare module 'models/finance/expenses.js' {
  interface ExpenseExtendedFields {
    group: never;
  }

  interface Expense {
    // Map
    group?: ExpenseGroupLite;
  }
}

// View Models

export interface ExpenseGroupVm extends Omit<DocViewModel<ExpenseGroup>, 'description'> {
  description: string | null;
}

declare module 'models/finance/expenses.js' {
  interface ExpenseVm {
    // Map
    group: ExpenseGroupLite | null;
  }
}

// API Models

export interface ExpenseGroupAm extends Omit<DocApiModel<ExpenseGroup>, 'description'> {
  description?: string | null;
}

declare module 'models/finance/expenses.js' {
  interface ExpenseAm {
    // Map
    group?: ExpenseGroupLite | null;
  }
}
