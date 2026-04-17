import type { Ref } from 'vue';
import { ref } from 'vue';

import { defineStore } from 'pinia';

import { where } from 'firebase/firestore';

import { range, sortBy } from 'lodash-es';

import type { Expense, Transaction } from 'models/finance/index.js';
import type {
  SupplierRangeReport,
  SupplierReport,
  SupplierReportDetail,
  SupplierYearlyReport,
} from 'models/reports/index.js';

import type { ReleaseDocsActionPayload } from 'stores/firebase-firestore/index.js';

import loadFinanceDetailsByTransaction from 'services/reports/loadFinanceDetailsByTransaction.js';
import loadGeneralExpenses from 'services/reports/loadGeneralExpenses.js';
import loadProjects from 'services/reports/loadProjects.js';

import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

export const useSuppliersReportsStore = defineStore('SuppliersReports', () => {
  // Private

  const { releaseDocsTimeout } = requiredConfigEntries('releaseDocsTimeout');

  let releaseSuppliersReportsTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const ec = useExpenseCalculator<Expense>();
  const tc = useTransactionCalculator<Transaction>();

  async function loadReportContent(supplierId: string, startDate: Date, endDate: Date) {
    const yearOfStartDate = startDate.getFullYear();
    const yearOfEndDate = endDate.getFullYear();

    const years = useSelectDateRange().yearOptions.value;

    if (yearOfStartDate > years[years.length - 1]!) {
      await loadYearlyReport(supplierId, yearOfStartDate - 1);
    }

    let details: SupplierReportDetail[];

    let beginningBalance: number;

    if (
      startDate.valueOf() === new Date(yearOfEndDate, 0, 1).valueOf() &&
      endDate.valueOf() === new Date(yearOfEndDate, 11, 31).valueOf()
    ) {
      details = await loadSupplierDetails(supplierId, startDate, endDate);

      beginningBalance =
        yearOfStartDate === years[years.length - 1]
          ? 0
          : yearlyReport(supplierId, yearOfStartDate - 1).content.endingBalance;

      for (let i = 0; i < details.length; i++) {
        if (i === 0) {
          processDetail(details[i]!, beginningBalance);
        } else {
          processDetail(details[i]!, details[i - 1]!.balance);
        }
      }
    } else {
      for (let year = yearOfStartDate; year <= yearOfEndDate; year++) {
        await loadYearlyReport(supplierId, year);
      }

      details = range(yearOfStartDate, yearOfEndDate + 1).flatMap((year) =>
        yearlyReport(supplierId, year).content.details.filter(
          (detail) =>
            detail.document.issueDate >= startDate && detail.document.issueDate <= endDate,
        ),
      );

      const sameYearOfStartDateEarlierDetails = yearlyReport(
        supplierId,
        yearOfStartDate,
      ).content.details.filter((detail) => detail.document.issueDate < startDate);

      if (sameYearOfStartDateEarlierDetails.length === 0) {
        beginningBalance = yearlyReport(supplierId, yearOfStartDate).content.beginningBalance;
      } else {
        beginningBalance =
          sameYearOfStartDateEarlierDetails[sameYearOfStartDateEarlierDetails.length - 1]!.balance;
      }
    }

    const lastDetail =
      details.length === 0
        ? {
            balance: beginningBalance,
          }
        : details[details.length - 1]!;

    const endingBalance = lastDetail.balance;

    const content: SupplierReport = {
      beginningBalance,
      details,
      endingBalance,
    };

    return content;

    function processDetail(detail: SupplierReportDetail, previousBalance: number) {
      if (detail.document === detail.expense) {
        detail.expenseAmount = ec.expenseTotal(detail.expense);
      } else if (detail.document === detail.transaction) {
        detail.paymentAmount =
          tc.transactionTotal(detail.transaction) *
          (tc.transactionNegative(detail.transaction) ? -1 : 1);
      }

      detail.expenseBalance = ec.expenseBalance(detail.expense);

      detail.balance = previousBalance + (detail.expenseAmount || 0) - (detail.paymentAmount || 0);

      detail.balanceIncreased = detail.balance > previousBalance;
      detail.balanceDecreased = detail.balance < previousBalance;
    }
  }

  async function loadSupplierDetails(supplierId: string, startDate: Date, endDate: Date) {
    const projects = await loadProjects(
      startDate,
      endDate,
      where('supplierIds', 'array-contains', supplierId),
    );
    const generalExpenses = await loadGeneralExpenses(
      startDate,
      endDate,
      where('supplier.id', '==', supplierId),
    );
    const detailsByTransaction = await loadFinanceDetailsByTransaction(
      startDate,
      endDate,
      where('supplierId', '==', supplierId),
    );

    const defaultValues: Pick<
      SupplierReportDetail,
      'expenseBalance' | 'balance' | 'balanceIncreased' | 'balanceDecreased'
    > = {
      expenseBalance: 0,
      balance: 0,
      balanceIncreased: false,
      balanceDecreased: false,
    };

    let details: SupplierReportDetail[] = [
      // Project expenses
      ...projects.flatMap((project) =>
        project.expenses
          .filter(
            (expense) =>
              expense.supplier.id === supplierId && expense.isCompleted && !expense.isCancelled,
          )
          .flatMap((expense) => ({
            document: expense,
            project,
            expense,
            ...defaultValues,
          })),
      ),

      // Project expense transactions
      ...detailsByTransaction.projects.flatMap((project) =>
        project.expenses
          .filter((expense) => expense.supplier.id === supplierId)
          .flatMap((expense) =>
            expense.transactions
              .filter(
                (transaction) =>
                  transaction.issueDate >= startDate &&
                  transaction.issueDate <= endDate &&
                  transaction.isCleared &&
                  !transaction.isCancelled,
              )
              .map((transaction) => ({
                document: transaction,
                project,
                expense,
                transaction,
                ...defaultValues,
              })),
          ),
      ),

      // General expenses
      ...generalExpenses.map((expense) => ({
        document: expense,
        expense,
        ...defaultValues,
      })),

      // General expense transactions
      ...detailsByTransaction.generalExpenses.flatMap((expense) =>
        expense.transactions
          .filter(
            (transaction) =>
              transaction.issueDate >= startDate &&
              transaction.issueDate <= endDate &&
              transaction.isCleared &&
              !transaction.isCancelled,
          )
          .map((transaction) => ({
            document: transaction,
            expense,
            transaction,
            ...defaultValues,
          })),
      ),
    ];

    details = sortBy(details, (value) => value.document.createDate);
    details = sortBy(details, (value) => value.document.issueDate);

    return details;
  }

  // State

  const yearlyReports = ref([]) as Ref<SupplierYearlyReport[]>;

  // Getters

  function hasReports() {
    return yearlyReports.value.length > 0;
  }

  function yearlyReport(supplierId: string, year: number) {
    return (
      yearlyReports.value.find((value) => value.supplierId === supplierId && value.year === year) ||
      (() => {
        throw new Error(`Supplier Yearly Report ${supplierId} ${year.toString()} not available`);
      })()
    );
  }

  async function rangeReport(supplierId: string, startDate: Date, endDate: Date) {
    let content: SupplierReport;
    const yearOfEndDate = endDate.getFullYear();

    if (
      startDate.valueOf() === new Date(yearOfEndDate, 0, 1).valueOf() &&
      endDate.valueOf() === new Date(yearOfEndDate, 11, 31).valueOf()
    ) {
      await loadYearlyReport(supplierId, yearOfEndDate);
      content = yearlyReport(supplierId, yearOfEndDate).content;
    } else {
      content = await loadReportContent(supplierId, startDate, endDate);
    }

    const report: SupplierRangeReport = {
      supplierId,
      startDate,
      endDate,
      content,
    };

    return report;
  }

  // Actions

  async function loadYearlyReport(supplierId: string, year: number) {
    if (releaseSuppliersReportsTimeoutId) {
      clearTimeout(releaseSuppliersReportsTimeoutId);
      releaseSuppliersReportsTimeoutId = null;
    }

    if (
      yearlyReports.value.some((value) => value.supplierId === supplierId && value.year === year)
    ) {
      return;
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const content = await loadReportContent(supplierId, startDate, endDate);

    const report: SupplierYearlyReport = {
      supplierId,
      year,
      content,
    };

    yearlyReports.value.push(report);
  }

  function releaseSuppliersReports({ immediately }: ReleaseDocsActionPayload) {
    if (immediately) {
      yearlyReports.value = [];
    } else {
      releaseSuppliersReportsTimeoutId = setTimeout(() => {
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
    releaseSuppliersReports,
  };
});
