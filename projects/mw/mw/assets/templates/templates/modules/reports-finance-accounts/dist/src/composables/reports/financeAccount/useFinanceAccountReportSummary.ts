import { computed } from 'vue';

import { sumBy } from 'lodash-es';

import type { FinanceAccountReportDetail } from 'models/reports/index.js';

export default function useFinanceAccountReportSummary(details: FinanceAccountReportDetail[]) {
  // Computed

  const totalCredit = computed(() => sumBy(details, (detail) => detail.credit || 0));

  const totalDebit = computed(() => sumBy(details, (detail) => detail.debit || 0));

  return {
    totalCredit,
    totalDebit,
  };
}
