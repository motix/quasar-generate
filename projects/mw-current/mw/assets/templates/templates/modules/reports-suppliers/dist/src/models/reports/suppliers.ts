import type { Expense, Project, SupplierLite, Transaction } from 'models/finance/index.js';
import type { RangeReport, YearlyReport } from 'models/reports/index.js';

export interface SupplierReport {
  beginningBalance: number;
  details: SupplierReportDetail[];
  endingBalance: number;
}

export interface SupplierReportDetail {
  document: Expense | Transaction;
  project?: Project;
  expense: Expense;
  transaction?: Transaction;
  expenseAmount?: number;
  paymentAmount?: number;
  expenseBalance: number;
  balance: number;
  balanceIncreased: boolean;
  balanceDecreased: boolean;
}

export type SuppliersReport = SuppliersReportDetail[];

export interface SuppliersReportDetail {
  supplier: SupplierLite;
  beginningBalance: number;
  expenseAmount: number;
  paymentAmount: number;
  endingBalance: number;
}

export type SuppliersYearlyReport = YearlyReport<SuppliersReport>;

export type SuppliersRangeReport = RangeReport<SuppliersReport>;

export interface SupplierYearlyReport extends YearlyReport<SupplierReport> {
  supplierId: string;
}

export interface SupplierRangeReport extends RangeReport<SupplierReport> {
  supplierId: string;
}
