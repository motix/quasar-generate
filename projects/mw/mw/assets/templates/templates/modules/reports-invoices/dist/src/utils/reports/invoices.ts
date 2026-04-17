import type { InvoicesReportDetail } from 'models/reports/index.js';

export function isProjectInvoiceReportDetail(detail: InvoicesReportDetail) {
  return !!detail.project;
}

export function isGeneralInvoiceReportDetail(detail: InvoicesReportDetail) {
  return !detail.project;
}
