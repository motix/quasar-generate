import type { SupplierReportDetail } from 'models/reports/index.js';

export function isBalancedExpenseReportDetail(detail: SupplierReportDetail) {
  return detail.expenseBalance === 0;
}

export function isUnbalancedExpenseReportDetail(detail: SupplierReportDetail) {
  return detail.expenseBalance !== 0;
}
