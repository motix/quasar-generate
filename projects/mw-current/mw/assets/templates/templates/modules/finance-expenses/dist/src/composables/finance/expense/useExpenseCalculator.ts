import { sumBy } from 'lodash-es';

import { checkAndCalculate } from 'utils/calculation.js';

import type { Expense, ExpenseVm } from 'models/finance/index.js';

import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';

export default function useExpenseCalculator<TExpense extends Expense | ExpenseVm>() {
  type TExpenseDetail = TExpense['details'][number];
  type TTransaction = TExpense['transactions'][number];

  const tc = useTransactionCalculator<TTransaction>();

  // Expense

  function expenseTotalQuantity(expense: TExpense) {
    return sumBy<TExpenseDetail>(
      expense.details,
      (detail) => checkAndCalculate(() => detail.quantity as number, detail.quantity) || 0,
    );
  }

  function expenseSubtotal(expense: TExpense) {
    return sumBy<TExpenseDetail>(expense.details, (detail) => expenseDetailAmount(detail) || 0);
  }

  function expenseVatExcludedTotal(expense: TExpense) {
    return (
      expenseSubtotal(expense) -
      (checkAndCalculate(() => expense.discount as number, expense.discount) || 0)
    );
  }

  function expenseVat(expense: TExpense) {
    const vatAdjustment =
      checkAndCalculate(() => expense.vatAdjustment as number, expense.vatAdjustment) || 0;

    if (expense.vatableAmount == null || expense.vatableAmount === '') {
      if (
        expense.secondVatPercent == null ||
        expense.secondVatPercent === '' ||
        expense.secondVatableAmount == null ||
        expense.secondVatableAmount === ''
      ) {
        return checkAndCalculate(
          () =>
            Math.round((expense.vatPercent as number) * expenseVatExcludedTotal(expense)) +
            vatAdjustment,
          expense.vatPercent,
        );
      } else {
        return checkAndCalculate(
          () =>
            Math.round(
              (expense.vatPercent as number) *
                (expenseVatExcludedTotal(expense) - (expense.secondVatableAmount as number)),
            ) +
            Math.round(
              (expense.secondVatPercent as number) * (expense.secondVatableAmount as number),
            ) +
            vatAdjustment,
          expense.vatPercent,
          expense.secondVatPercent,
          expense.secondVatableAmount,
        );
      }
    } else {
      if (
        expense.secondVatPercent == null ||
        expense.secondVatPercent === '' ||
        expense.secondVatableAmount == null ||
        expense.secondVatableAmount === ''
      ) {
        return checkAndCalculate(
          () =>
            Math.round((expense.vatPercent as number) * (expense.vatableAmount as number)) +
            vatAdjustment,
          expense.vatPercent,
          expense.vatableAmount,
        );
      } else {
        return checkAndCalculate(
          () =>
            Math.round(
              (expense.vatPercent as number) *
                ((expense.vatableAmount as number) - (expense.secondVatableAmount as number)),
            ) +
            Math.round(
              (expense.secondVatPercent as number) * (expense.secondVatableAmount as number),
            ) +
            vatAdjustment,
          expense.vatPercent,
          expense.vatableAmount,
          expense.secondVatPercent,
          expense.secondVatableAmount,
        );
      }
    }
  }

  function expenseTotal(expense: TExpense) {
    return expenseVatExcludedTotal(expense) + (expenseVat(expense) || 0);
  }

  function expenseTotalPayment(expense: TExpense) {
    return sumBy<TTransaction>(expense.transactions, (transaction) =>
      !transaction.isCleared || transaction.isCancelled
        ? 0
        : tc.transactionTotal(transaction) * (tc.transactionNegative(transaction) ? -1 : 1),
    );
  }

  function expenseBalance(expense: TExpense) {
    return expenseTotal(expense) - expenseTotalPayment(expense);
  }

  // ExpenseDetail

  function expenseDetailAmount(expenseDetail: TExpenseDetail) {
    return checkAndCalculate(
      () => (expenseDetail.unitPrice as number) * (expenseDetail.quantity as number),
      expenseDetail.unitPrice,
      expenseDetail.quantity,
    );
  }

  return {
    expenseTotalQuantity,
    expenseSubtotal,
    expenseVatExcludedTotal,
    expenseVat,
    expenseTotal,
    expenseTotalPayment,
    expenseBalance,
    expenseDetailAmount,
  };
}
