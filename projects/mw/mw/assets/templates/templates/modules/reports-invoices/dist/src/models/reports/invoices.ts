import type {
  FinanceAccountLite,
  Invoice,
  InvoiceGroupLite,
  Project,
} from 'models/finance/index.js';
import type { RangeReport, YearlyReport } from 'models/reports/index.js';

export interface InvoicesReport {
  details: InvoicesReportDetail[];
  financeAccounts: FinanceAccountLite[];
  invoiceGroups: InvoiceGroupLite[];
}

export interface InvoicesReportDetail {
  invoice: Invoice;
  project?: Project;
  total: number;
  totalReceipt: number;
  balance: number;
  totalReceiptByFinanceAccount: Record<string, number>;
}

export type InvoicesYearlyReport = YearlyReport<InvoicesReport>;

export type InvoicesRangeReport = RangeReport<InvoicesReport>;
