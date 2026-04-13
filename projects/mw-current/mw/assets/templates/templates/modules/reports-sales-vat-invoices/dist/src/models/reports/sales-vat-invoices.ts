import type { SalesContract, VatInvoice } from 'models/finance/index.js';
import type { RangeReport, YearlyReport } from 'models/reports/index.js';

export type SalesVatInvoicesReport = SalesVatInvoicesReportDetail[];

export interface SalesVatInvoicesReportDetail {
  document: VatInvoice;
  salesContract: SalesContract;
}

export interface SalesVatInvoicesYearlyReport extends YearlyReport<SalesVatInvoicesReport> {
  customerId?: string;
}

export interface SalesVatInvoicesRangeReport extends RangeReport<SalesVatInvoicesReport> {
  customerId?: string;
}
