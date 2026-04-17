import type { CustomerReportDetail } from 'models/reports/index.js';

export function isBalancedInvoiceReportDetail(detail: CustomerReportDetail) {
  return detail.invoiceBalance === 0;
}

export function isUnbalancedInvoiceReportDetail(detail: CustomerReportDetail) {
  return detail.invoiceBalance !== 0;
}
