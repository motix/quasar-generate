import { computed } from 'vue';

import { sumBy } from 'lodash-es';

import type { FinanceAccountLite, Invoice } from 'models/finance/index.js';
import type { InvoicesReportDetail } from 'models/reports/index.js';

import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';

export default function useInvoicesReportSummary(
  details: InvoicesReportDetail[],
  financeAccounts: FinanceAccountLite[],
) {
  // Private

  const mc = useInvoiceCalculator<Invoice>();

  // Computed

  const totalInvoice = computed(() => sumBy(details, (detail) => mc.invoiceTotal(detail.invoice)));

  const totalReceipt = computed(() =>
    sumBy(details, (detail) => mc.invoiceTotalReceipt(detail.invoice)),
  );

  const totalBalance = computed(() =>
    sumBy(details, (detail) => mc.invoiceBalance(detail.invoice)),
  );

  const totalReceiptByFinanceAccount = computed(() => {
    const entries = new Map(
      financeAccounts.map((financeAccount) => [
        financeAccount.id,
        sumBy(details, (detail) => detail.totalReceiptByFinanceAccount[financeAccount.id] || 0),
      ]),
    );

    return Object.fromEntries(entries);
  });

  return {
    totalInvoice,
    totalReceipt,
    totalBalance,
    totalReceiptByFinanceAccount,
  };
}
