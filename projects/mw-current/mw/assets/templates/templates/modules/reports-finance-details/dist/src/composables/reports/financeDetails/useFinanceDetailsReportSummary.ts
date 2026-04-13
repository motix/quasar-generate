import { computed } from 'vue';

import { sumBy } from 'lodash-es';

import type { FinanceDetailsReportDetail } from 'models/reports/index.js';

export default function useFinanceDetailsReportSummary(details: FinanceDetailsReportDetail[]) {
  // Computed

  const totalInvoiceAmount = computed(() => sumBy(details, (detail) => detail.invoiceAmount || 0));

  const totalCapitalContributionAmount = computed(() =>
    sumBy(details, (detail) =>
      detail.invoice?.isCapitalContribution === true ? detail.invoiceAmount || 0 : 0,
    ),
  );

  const totalExternalInvoiceAmount = computed(() =>
    sumBy(details, (detail) =>
      detail.invoice?.isExternal === true ? detail.invoiceAmount || 0 : 0,
    ),
  );

  const totalBusinessInvoiceAmount = computed(
    () =>
      totalInvoiceAmount.value -
      totalCapitalContributionAmount.value -
      totalExternalInvoiceAmount.value,
  );

  const totalReceiptAmount = computed(() => sumBy(details, (detail) => detail.receiptAmount || 0));

  const totalExpenseAmount = computed(() => sumBy(details, (detail) => detail.expenseAmount || 0));

  const totalCapitalWithdrawalAmount = computed(() =>
    sumBy(details, (detail) =>
      detail.expense?.isCapitalWithdrawal === true ? detail.expenseAmount || 0 : 0,
    ),
  );

  const totalExternalExpenseAmount = computed(() =>
    sumBy(details, (detail) =>
      detail.expense?.isExternal === true ? detail.expenseAmount || 0 : 0,
    ),
  );

  const totalBusinessExpenseAmount = computed(
    () =>
      totalExpenseAmount.value -
      totalCapitalWithdrawalAmount.value -
      totalExternalExpenseAmount.value,
  );

  const totalPaymentAmount = computed(() => sumBy(details, (detail) => detail.paymentAmount || 0));

  return {
    totalInvoiceAmount,
    totalCapitalContributionAmount,
    totalExternalInvoiceAmount,
    totalBusinessInvoiceAmount,
    totalReceiptAmount,
    totalExpenseAmount,
    totalCapitalWithdrawalAmount,
    totalExternalExpenseAmount,
    totalBusinessExpenseAmount,
    totalPaymentAmount,
  };
}
