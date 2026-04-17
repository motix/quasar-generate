import type {
  CustomerLite,
  Expense,
  Invoice,
  Project,
  SupplierLite,
  Transaction,
} from 'models/finance/index.js';
import type { AllYearsReport, MonthlyReport, YearlyReport } from 'models/reports/index.js';

export interface FinanceDetailsReport {
  beginningReceivable: number;
  beginningPayable: number;
  beginningAvailableCash: number;
  details: FinanceDetailsReportDetail[];
  endingReceivable: number;
  endingPayable: number;
  endingAvailableCash: number;
}

export interface FinanceDetailsReportDetail {
  document: Invoice | Expense | Transaction;
  project?: Project;
  invoice?: Invoice;
  expense?: Expense;
  transaction?: Transaction;
  customer?: CustomerLite;
  supplier?: SupplierLite;
  invoiceAmount?: number;
  receiptAmount?: number;
  receivable: number;
  receivableIncreased: boolean;
  receivableDecreased: boolean;
  expenseAmount?: number;
  paymentAmount?: number;
  payable: number;
  payableIncreased: boolean;
  payableDecreased: boolean;
  availableCash: number;
  availableCashIncreased: boolean;
  availableCashDecreased: boolean;
}

export interface FinanceDetailsReportsCacheRecord {
  year: number;
  beginningReceivable: number;
  beginningPayable: number;
  beginningAvailableCash: number;
  endingReceivable: number;
  endingPayable: number;
  endingAvailableCash: number;
}

export type FinanceDetailsMonthlyReport = MonthlyReport<FinanceDetailsReport>;

export type FinanceDetailsYearlyReport = YearlyReport<FinanceDetailsReport>;

export type FinanceDetailsAllYearsReport = AllYearsReport<FinanceDetailsReport>;
