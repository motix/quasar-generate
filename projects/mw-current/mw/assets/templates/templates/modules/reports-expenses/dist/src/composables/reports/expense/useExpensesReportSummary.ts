import { computed } from 'vue';

import { sumBy } from 'lodash-es';

import type { Expense, FinanceAccountLite } from 'models/finance/index.js';
import type { ExpensesReportDetail } from 'models/reports/index.js';

import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';

export default function useExpensesReportSummary(
  details: ExpensesReportDetail[],
  financeAccounts: FinanceAccountLite[],
) {
  // Private

  const mc = useExpenseCalculator<Expense>();

  // Computed

  const totalExpense = computed(() => sumBy(details, (detail) => mc.expenseTotal(detail.expense)));

  const totalPayment = computed(() =>
    sumBy(details, (detail) => mc.expenseTotalPayment(detail.expense)),
  );

  const totalBalance = computed(() =>
    sumBy(details, (detail) => mc.expenseBalance(detail.expense)),
  );

  const totalPaymentByFinanceAccount = computed(() => {
    const entries = new Map(
      financeAccounts.map((financeAccount) => [
        financeAccount.id,
        sumBy(details, (detail) => detail.totalPaymentByFinanceAccount[financeAccount.id] || 0),
      ]),
    );

    return Object.fromEntries(entries);
  });

  return {
    totalExpense,
    totalPayment,
    totalBalance,
    totalPaymentByFinanceAccount,
  };
}
