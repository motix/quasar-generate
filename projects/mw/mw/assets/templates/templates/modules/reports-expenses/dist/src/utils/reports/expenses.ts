import type { ExpensesReportDetail } from 'models/reports/index.js';

export function isProjectExpenseReportDetail(detail: ExpensesReportDetail) {
  return !!detail.project;
}

export function isGeneralExpenseReportDetail(detail: ExpensesReportDetail) {
  return !detail.project;
}
