import type { BalanceRecord } from 'models/finance/index.js';
import type { FinanceAccountReportDetail } from 'models/reports/index.js';

export function isFinanceAccountReportDetail(
  detail: FinanceAccountReportDetail | BalanceRecord,
): detail is FinanceAccountReportDetail {
  return !!(detail as FinanceAccountReportDetail).transaction;
}

export function isProjectInvoiceTransactionReportDetail(
  detail: FinanceAccountReportDetail | BalanceRecord,
): detail is FinanceAccountReportDetail {
  return isFinanceAccountReportDetail(detail) && !!detail.project && !!detail.invoice;
}

export function isProjectExpenseTransactionReportDetail(
  detail: FinanceAccountReportDetail | BalanceRecord,
): detail is FinanceAccountReportDetail {
  return isFinanceAccountReportDetail(detail) && !!detail.project && !!detail.expense;
}

export function isGeneralInvoiceTransactionReportDetail(
  detail: FinanceAccountReportDetail | BalanceRecord,
): detail is FinanceAccountReportDetail {
  return isFinanceAccountReportDetail(detail) && !detail.project && !!detail.invoice;
}

export function isGeneralExpenseTransactionReportDetail(
  detail: FinanceAccountReportDetail | BalanceRecord,
): detail is FinanceAccountReportDetail {
  return isFinanceAccountReportDetail(detail) && !detail.project && !!detail.expense;
}

export function isGeneralTransactionReportDetail(
  detail: FinanceAccountReportDetail | BalanceRecord,
): detail is FinanceAccountReportDetail {
  return (
    isFinanceAccountReportDetail(detail) && !detail.project && !detail.invoice && !detail.expense
  );
}
