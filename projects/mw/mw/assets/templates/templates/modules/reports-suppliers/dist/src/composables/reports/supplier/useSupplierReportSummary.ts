import { computed } from 'vue';

import { sumBy } from 'lodash-es';

import type { SupplierReportDetail } from 'models/reports/index.js';

export default function useSupplierReportSummary(details: SupplierReportDetail[]) {
  // Computed

  const totalExpenseAmount = computed(() => sumBy(details, (detail) => detail.expenseAmount || 0));

  const totalPaymentAmount = computed(() => sumBy(details, (detail) => detail.paymentAmount || 0));

  return {
    totalExpenseAmount,
    totalPaymentAmount,
  };
}
