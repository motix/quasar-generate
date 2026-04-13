import { computed } from 'vue';

import { sumBy } from 'lodash-es';

import type { ReceivableReportDetail } from 'models/reports/index.js';

export default function useReceivableReportSummary(details: ReceivableReportDetail[]) {
  // Computed

  const totalBalance = computed(() => sumBy(details, (detail) => detail.balance));

  return {
    totalBalance,
  };
}
