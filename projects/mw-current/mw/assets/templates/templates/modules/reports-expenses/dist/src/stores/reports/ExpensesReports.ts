import type { Ref } from 'vue';
import { ref } from 'vue';

import { defineStore } from 'pinia';

import { range, sortBy, sumBy, uniqBy } from 'lodash-es';

import type { Expense, Transaction } from 'models/finance/index.js';
import type {
  ExpensesRangeReport,
  ExpensesReport,
  ExpensesReportDetail,
  ExpensesYearlyReport,
} from 'models/reports/index.js';

import type { ReleaseDocsActionPayload } from 'stores/firebase-firestore/index.js';

import loadGeneralExpenses from 'services/reports/loadGeneralExpenses.js';
import loadProjects from 'services/reports/loadProjects.js';

import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

export const useExpensesReportsStore = defineStore('ExpensesReport', () => {
  // Private

  const { releaseDocsTimeout } = requiredConfigEntries('releaseDocsTimeout');

  let releaseExpensesReportsTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const ec = useExpenseCalculator<Expense>();
  const tc = useTransactionCalculator<Transaction>();

  async function loadReportContent(startDate: Date, endDate: Date) {
    const yearOfStartDate = startDate.getFullYear();
    const yearOfEndDate = endDate.getFullYear();

    const years = useSelectDateRange().yearOptions.value;

    if (yearOfStartDate > years[years.length - 1]!) {
      await loadYearlyReport(yearOfStartDate - 1);
    }

    let details: ExpensesReportDetail[];

    if (
      startDate.valueOf() === new Date(yearOfEndDate, 0, 1).valueOf() &&
      endDate.valueOf() === new Date(yearOfEndDate, 11, 31).valueOf()
    ) {
      details = await loadDetails(startDate, endDate);
      details.forEach((value) => processDetail(value));
    } else {
      for (let year = yearOfStartDate; year <= yearOfEndDate; year++) {
        await loadYearlyReport(year);
      }

      details = range(yearOfStartDate, yearOfEndDate + 1).flatMap((year) =>
        yearlyReport(year).content.details.filter(
          (detail) => detail.expense.issueDate >= startDate && detail.expense.issueDate <= endDate,
        ),
      );
    }

    const content: ExpensesReport = {
      details,
      financeAccounts: buildFinanceAccountsFromDetails(details),
      expenseGroups: buildExpenseGroupsFromDetails(details),
    };

    return content;

    function processDetail(detail: ExpensesReportDetail) {
      const transactions = detail.expense.transactions.filter(
        (value) => value.isCleared && !value.isCancelled,
      );

      let financeAccounts = transactions.flatMap((transaction) => [
        ...(transaction.sourceFinanceAccount ? [transaction.sourceFinanceAccount] : []),
        ...(transaction.destinationFinanceAccount ? [transaction.destinationFinanceAccount] : []),
      ]);

      financeAccounts = uniqBy(financeAccounts, (value) => value.id);

      financeAccounts.forEach((financeAccount) => {
        detail.totalPaymentByFinanceAccount[financeAccount.id] =
          sumBy(
            transactions.filter(
              (value) => value.destinationFinanceAccount?.id === financeAccount.id,
            ),
            (value) => tc.transactionTotal(value),
          ) -
          sumBy(
            transactions.filter((value) => value.sourceFinanceAccount?.id === financeAccount.id),
            (value) => tc.transactionTotal(value),
          );
      });
    }

    function buildFinanceAccountsFromDetails(details: ExpensesReportDetail[]) {
      let financeAccounts = details
        .flatMap((detail) =>
          detail.expense.transactions.filter((value) => value.isCleared && !value.isCancelled),
        )
        .flatMap((transaction) => [
          ...(transaction.sourceFinanceAccount ? [transaction.sourceFinanceAccount] : []),
          ...(transaction.destinationFinanceAccount ? [transaction.destinationFinanceAccount] : []),
        ]);

      financeAccounts = sortBy(
        uniqBy(financeAccounts, (value) => value.id),
        (value) => value.name,
      );

      return financeAccounts;
    }

    function buildExpenseGroupsFromDetails(details: ExpensesReportDetail[]) {
      let expenseGroups = details.flatMap((detail) =>
        detail.expense.group ? [detail.expense.group] : [],
      );

      expenseGroups = sortBy(
        uniqBy(expenseGroups, (value) => value.id),
        (value) => value.name,
      );

      return expenseGroups;
    }
  }

  async function loadDetails(startDate: Date, endDate: Date) {
    let projects = await loadProjects(startDate, endDate);
    let generalExpenses = await loadGeneralExpenses(startDate, endDate);

    projects = projects.filter((project) =>
      project.expenses.some((expense) => expense.isCompleted && !expense.isCancelled),
    );
    generalExpenses = generalExpenses.filter(
      (expense) => expense.isCompleted && !expense.isCancelled,
    );

    let details: ExpensesReportDetail[] = [
      ...projects.flatMap((project) =>
        project.expenses
          .filter((expense) => expense.isCompleted && !expense.isCancelled)
          .map((expense) => ({
            expense,
            project,
            total: ec.expenseTotal(expense),
            totalPayment: ec.expenseTotalPayment(expense),
            balance: ec.expenseBalance(expense),
            totalPaymentByFinanceAccount: {},
          })),
      ),
      ...generalExpenses.map((expense) => ({
        expense,
        total: ec.expenseTotal(expense),
        totalPayment: ec.expenseTotalPayment(expense),
        balance: ec.expenseBalance(expense),
        totalPaymentByFinanceAccount: {},
      })),
    ];

    details = sortBy(details, (value) => value.expense.issueDate);

    return details;
  }

  // State

  const yearlyReports = ref([]) as Ref<ExpensesYearlyReport[]>;

  // Getters

  function hasReports() {
    return yearlyReports.value.length > 0;
  }

  function yearlyReport(year: number) {
    return (
      yearlyReports.value.find((value) => value.year === year) ||
      (() => {
        throw new Error(`Expenses Report ${year.toString()} not available`);
      })()
    );
  }

  async function rangeReport(startDate: Date, endDate: Date) {
    let content: ExpensesReport;
    const yearOfEndDate = endDate.getFullYear();

    if (
      startDate.valueOf() === new Date(yearOfEndDate, 0, 1).valueOf() &&
      endDate.valueOf() === new Date(yearOfEndDate, 11, 31).valueOf()
    ) {
      await loadYearlyReport(yearOfEndDate);
      content = yearlyReport(yearOfEndDate).content;
    } else {
      content = await loadReportContent(startDate, endDate);
    }

    const report: ExpensesRangeReport = {
      startDate,
      endDate,
      content,
    };

    return report;
  }

  // Actions

  async function loadYearlyReport(year: number) {
    if (releaseExpensesReportsTimeoutId) {
      clearTimeout(releaseExpensesReportsTimeoutId);
      releaseExpensesReportsTimeoutId = null;
    }

    if (yearlyReports.value.some((value) => value.year === year)) {
      return;
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const content = await loadReportContent(startDate, endDate);

    const report: ExpensesYearlyReport = {
      year,
      content,
    };

    yearlyReports.value.push(report);
  }

  function releaseExpensesReports({ immediately }: ReleaseDocsActionPayload) {
    if (immediately) {
      yearlyReports.value = [];
    } else {
      releaseExpensesReportsTimeoutId = setTimeout(() => {
        yearlyReports.value = [];
      }, releaseDocsTimeout);
    }
  }

  return {
    yearlyReports,
    hasReports,
    yearlyReport,
    rangeReport,
    loadYearlyReport,
    releaseExpensesReports,
  };
});
