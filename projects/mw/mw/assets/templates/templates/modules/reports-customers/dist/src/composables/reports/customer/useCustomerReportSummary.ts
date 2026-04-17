import { computed } from 'vue';

import { sumBy } from 'lodash-es';

import type { CustomerReportDetail } from 'models/reports/index.js';

export default function useCustomerReportSummary(details: CustomerReportDetail[]) {
  // Computed

  const totalInvoiceAmount = computed(() => sumBy(details, (detail) => detail.invoiceAmount || 0));

  const totalReceiptAmount = computed(() => sumBy(details, (detail) => detail.receiptAmount || 0));

  return {
    totalInvoiceAmount,
    totalReceiptAmount,
  };
}
