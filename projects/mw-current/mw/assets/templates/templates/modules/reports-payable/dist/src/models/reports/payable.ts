import type { Expense, Project, SupplierLite } from 'models/finance/index.js';

export type PayableReport = PayableReportDetail[];

export interface PayableReportDetail {
  supplier: SupplierLite;
  projects: Project[];
  generalExpenses: Expense[];
  balance: number;
}
