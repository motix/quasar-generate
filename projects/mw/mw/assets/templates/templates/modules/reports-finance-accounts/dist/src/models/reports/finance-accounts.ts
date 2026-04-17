import type {
  BalanceRecord,
  CustomerLite,
  Expense,
  FinanceAccountLite,
  Invoice,
  Project,
  SupplierLite,
  Transaction,
} from 'models/finance/index.js';
import type { RangeReport, YearlyReport } from 'models/reports/index.js';

export interface FinanceAccountReport {
  beginningBalance: number;
  details: FinanceAccountReportDetail[];
  detailsWithBalanceRecords: (FinanceAccountReportDetail | BalanceRecord)[];
  endingBalance: number;
}

export interface FinanceAccountReportDetail {
  transaction: Transaction;
  customer?: CustomerLite;
  supplier?: SupplierLite;
  otherFinanceAccount?: FinanceAccountLite;
  project?: Project;
  invoice?: Invoice;
  expense?: Expense;
  credit?: number;
  debit?: number;
  balance: number;
  balanceIncreased: boolean;
  balanceDecreased: boolean;
}

export interface FinanceAccountsReportsCacheRecord {
  financeAccountId: string;
  year: number;
  beginningBalance: number;
  endingBalance: number;
}

export interface FinanceAccountYearlyReport extends YearlyReport<FinanceAccountReport> {
  financeAccountId: string;
}

export interface FinanceAccountRangeReport extends RangeReport<FinanceAccountReport> {
  financeAccountId: string;
}
