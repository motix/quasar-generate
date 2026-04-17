import type { Expense, ExpenseAm, ExpenseVm } from 'models/finance/index.js';

// Models

declare module 'models/finance/projects.js' {
  interface ProjectExtendedFields {
    expenses: never;
  }

  interface Project {
    // Map
    expenses: Expense[];
  }
}

// View Models

declare module 'models/finance/projects.js' {
  interface ProjectVm {
    // Map
    expenses: ExpenseVm[];
  }
}

// API Models

declare module 'models/finance/projects.js' {
  interface ProjectAm {
    // Map
    expenses: ExpenseAm[];
  }
}
