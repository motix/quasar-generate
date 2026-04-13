import { computed } from 'vue';

import { sumBy } from 'lodash-es';

import type { PayableReportDetail } from 'models/reports/index.js';

export default function usePayableReportSummary(details: PayableReportDetail[]) {
  // Computed

  const totalBalance = computed(() => sumBy(details, (detail) => detail.balance));

  return {
    totalBalance,
  };
}
