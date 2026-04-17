import type {
  Expense,
  ExpenseGroupLite,
  FinanceAccountLite,
  Project,
} from 'models/finance/index.js';
import type { RangeReport, YearlyReport } from 'models/reports/index.js';

export interface ExpensesReport {
  details: ExpensesReportDetail[];
  financeAccounts: FinanceAccountLite[];
  expenseGroups: ExpenseGroupLite[];
}

export interface ExpensesReportDetail {
  expense: Expense;
  project?: Project;
  total: number;
  totalPayment: number;
  balance: number;
  totalPaymentByFinanceAccount: Record<string, number>;
}

export type ExpensesYearlyReport = YearlyReport<ExpensesReport>;

export type ExpensesRangeReport = RangeReport<ExpensesReport>;
