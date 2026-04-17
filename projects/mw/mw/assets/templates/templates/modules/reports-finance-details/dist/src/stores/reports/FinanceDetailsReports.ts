import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { date } from 'quasar';

import { range, sortBy } from 'lodash-es';

import assignOptional from 'utils/assignOptional.js';

import type { Expense, Invoice, Transaction } from 'models/finance/index.js';
import type {
  FinanceDetailsAllYearsReport,
  FinanceDetailsMonthlyReport,
  FinanceDetailsReport,
  FinanceDetailsReportDetail,
  FinanceDetailsReportsCacheRecord,
  FinanceDetailsYearlyReport,
} from 'models/reports/index.js';

import type { ReleaseDocsActionPayload } from 'stores/firebase-firestore/index.js';

import loadFinanceDetailsByTransaction from 'services/reports/loadFinanceDetailsByTransaction.js';
import loadFinanceDetailsReportsCache from 'services/reports/loadFinanceDetailsReportsCache.js';
import loadGeneralExpenses from 'services/reports/loadGeneralExpenses.js';
import loadGeneralInvoices from 'services/reports/loadGeneralInvoices.js';
import loadProjects from 'services/reports/loadProjects.js';
import updateFinanceDetailsReportsCache from 'services/reports/updateFinanceDetailsReportsCache.js';

import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';
import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

export const useFinanceDetailsReportsStore = defineStore('FinanceDetailsReports', () => {
  // Private

  const { releaseDocsTimeout } = requiredConfigEntries('releaseDocsTimeout');

  let releaseFinanceDetailsReportsTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const cache = ref(null) as Ref<Record<number, FinanceDetailsReportsCacheRecord> | null>;

  const ic = useInvoiceCalculator<Invoice>();
  const ec = useExpenseCalculator<Expense>();
  const tc = useTransactionCalculator<Transaction>();

  const loadedCache = computed(
    () =>
      cache.value ||
      (() => {
        throw new Error('cache not ready');
      })(),
  );

  async function loadCache() {
    if (cache.value !== null) {
      return;
    }

    cache.value = Object.fromEntries(
      (await loadFinanceDetailsReportsCache()).map((value) => [value.year, value]),
    );
  }

  async function updateCahce(cacheRecord: FinanceDetailsReportsCacheRecord) {
    await updateFinanceDetailsReportsCache(cacheRecord);

    cache.value = null;
    await loadCache();
  }

  async function loadReportContent(startDate: Date, endDate: Date) {
    await loadCache();

    const yearOfStartDate = startDate.getFullYear();
    const yearOfEndDate = endDate.getFullYear();

    const years = useSelectDateRange().yearOptions.value;

    if (yearOfStartDate > years[years.length - 1]! && !loadedCache.value[yearOfStartDate - 1]) {
      await loadYearlyReport(yearOfStartDate - 1);
    }

    let details: FinanceDetailsReportDetail[];

    let beginningReceivable: number;
    let beginningPayable: number;
    let beginningAvailableCash: number;

    if (
      startDate.valueOf() === new Date(yearOfEndDate, 0, 1).valueOf() &&
      endDate.valueOf() === new Date(yearOfEndDate, 11, 31).valueOf()
    ) {
      details = await loadFinanceDetails(startDate, endDate);

      beginningReceivable =
        yearOfStartDate === years[years.length - 1]
          ? 0
          : loadedCache.value[yearOfStartDate - 1]!.endingReceivable;
      beginningPayable =
        yearOfStartDate === years[years.length - 1]
          ? 0
          : loadedCache.value[yearOfStartDate - 1]!.endingPayable;
      beginningAvailableCash =
        yearOfStartDate === years[years.length - 1]
          ? 0
          : loadedCache.value[yearOfStartDate - 1]!.endingAvailableCash;

      for (let i = 0; i < details.length; i++) {
        if (i === 0) {
          processDetail(details[i]!, beginningReceivable, beginningPayable, beginningAvailableCash);
        } else {
          processDetail(
            details[i]!,
            details[i - 1]!.receivable,
            details[i - 1]!.payable,
            details[i - 1]!.availableCash,
          );
        }
      }
    } else {
      for (let year = yearOfStartDate; year <= yearOfEndDate; year++) {
        await loadYearlyReport(year);
      }

      details = range(yearOfStartDate, yearOfEndDate + 1).flatMap((year) =>
        yearlyReport(year).content.details.filter(
          (detail) =>
            detail.document.issueDate >= startDate && detail.document.issueDate <= endDate,
        ),
      );

      const sameYearOfStartDateEarlierDetails = yearlyReport(
        yearOfStartDate,
      ).content.details.filter((detail) => detail.document.issueDate < startDate);

      if (sameYearOfStartDateEarlierDetails.length === 0) {
        beginningReceivable = yearlyReport(yearOfStartDate).content.beginningReceivable;
        beginningPayable = yearlyReport(yearOfStartDate).content.beginningPayable;
        beginningAvailableCash = yearlyReport(yearOfStartDate).content.beginningAvailableCash;
      } else {
        beginningReceivable =
          sameYearOfStartDateEarlierDetails[sameYearOfStartDateEarlierDetails.length - 1]!
            .receivable;
        beginningPayable =
          sameYearOfStartDateEarlierDetails[sameYearOfStartDateEarlierDetails.length - 1]!.payable;
        beginningAvailableCash =
          sameYearOfStartDateEarlierDetails[sameYearOfStartDateEarlierDetails.length - 1]!
            .availableCash;
      }
    }

    const lastDetail =
      details.length === 0
        ? {
            receivable: beginningReceivable,
            payable: beginningPayable,
            availableCash: beginningAvailableCash,
          }
        : details[details.length - 1]!;

    const endingReceivable = lastDetail.receivable;
    const endingPayable = lastDetail.payable;
    const endingAvailableCash = lastDetail.availableCash;

    const content: FinanceDetailsReport = {
      beginningReceivable,
      beginningPayable,
      beginningAvailableCash,
      details,
      endingReceivable,
      endingPayable,
      endingAvailableCash,
    };

    return content;

    function processDetail(
      detail: FinanceDetailsReportDetail,
      previousReceivable: number,
      previousPayable: number,
      previousAvailableCash: number,
    ) {
      detail = assignOptional<FinanceDetailsReportDetail>(detail, {
        customer: detail.invoice?.customer,
        supplier: detail.expense?.supplier,
      });

      if (detail.document === detail.invoice) {
        detail.invoiceAmount = ic.invoiceTotal(detail.invoice);
        detail.receivable = previousReceivable + detail.invoiceAmount;
        detail.payable = previousPayable;
      } else if (detail.document === detail.expense) {
        detail.receivable = previousReceivable;
        detail.expenseAmount = ec.expenseTotal(detail.expense);
        detail.payable = previousPayable + detail.expenseAmount;
      } else if (detail.document === detail.transaction) {
        if (detail.transaction.type === 'Receipt' || detail.transaction.type === 'Receipt Refund') {
          detail.receiptAmount =
            tc.transactionTotal(detail.transaction) *
            (tc.transactionNegative(detail.transaction) ? -1 : 1);
        }

        detail.receivable = previousReceivable - (detail.receiptAmount || 0);

        if (detail.transaction.type === 'Payment' || detail.transaction.type === 'Payment Refund') {
          detail.paymentAmount =
            tc.transactionTotal(detail.transaction) *
            (tc.transactionNegative(detail.transaction) ? -1 : 1);
        }

        detail.payable = previousPayable - (detail.paymentAmount || 0);
      }

      detail.availableCash =
        previousAvailableCash + (detail.receiptAmount || 0) - (detail.paymentAmount || 0);

      detail.receivableIncreased = detail.receivable > previousReceivable;
      detail.receivableDecreased = detail.receivable < previousReceivable;
      detail.payableIncreased = detail.payable > previousPayable;
      detail.payableDecreased = detail.payable < previousPayable;
      detail.availableCashIncreased = detail.availableCash > previousAvailableCash;
      detail.availableCashDecreased = detail.availableCash < previousAvailableCash;
    }
  }

  async function loadFinanceDetails(startDate: Date, endDate: Date) {
    const projects = await loadProjects(startDate, endDate);
    const generalInvoices = await loadGeneralInvoices(startDate, endDate);
    const generalExpenses = await loadGeneralExpenses(startDate, endDate);
    const detailsByTransaction = await loadFinanceDetailsByTransaction(startDate, endDate);

    const defaultValues: Pick<
      FinanceDetailsReportDetail,
      | 'receivable'
      | 'receivableIncreased'
      | 'receivableDecreased'
      | 'payable'
      | 'payableIncreased'
      | 'payableDecreased'
      | 'availableCash'
      | 'availableCashIncreased'
      | 'availableCashDecreased'
    > = {
      receivable: 0,
      receivableIncreased: false,
      receivableDecreased: false,
      payable: 0,
      payableIncreased: false,
      payableDecreased: false,
      availableCash: 0,
      availableCashIncreased: false,
      availableCashDecreased: false,
    };

    let details: FinanceDetailsReportDetail[] = [
      // Project invoices
      ...projects.flatMap((project) =>
        project.quotations.flatMap((quotation) =>
          !!quotation.invoice && quotation.invoice.isCompleted && !quotation.invoice.isCancelled
            ? [
                {
                  document: quotation.invoice,
                  project,
                  invoice: quotation.invoice,
                  ...defaultValues,
                },
              ]
            : [],
        ),
      ),

      // Project invoice transactions
      ...detailsByTransaction.projects.flatMap((project) =>
        project.quotations.flatMap((quotation) => {
          const invoice = quotation.invoice;

          return invoice
            ? [
                ...invoice.transactions
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
                    invoice,
                    transaction,
                    ...defaultValues,
                  })),
              ]
            : [];
        }),
      ),

      // Project expenses
      ...projects.flatMap((project) =>
        project.expenses
          .filter((expense) => expense.isCompleted && !expense.isCancelled)
          .flatMap((expense) => ({
            document: expense,
            project,
            expense,
            ...defaultValues,
          })),
      ),

      // Project expense transactions
      ...detailsByTransaction.projects.flatMap((project) =>
        project.expenses.flatMap((expense) =>
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

      // General invoices
      ...generalInvoices.map((invoice) => ({
        document: invoice,
        invoice,
        ...defaultValues,
      })),

      // General invoice transactions
      ...detailsByTransaction.generalInvoices.flatMap((invoice) =>
        invoice.transactions
          .filter(
            (transaction) =>
              transaction.issueDate >= startDate &&
              transaction.issueDate <= endDate &&
              transaction.isCleared &&
              !transaction.isCancelled,
          )
          .map((transaction) => ({
            document: transaction,
            invoice,
            transaction,
            ...defaultValues,
          })),
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

  const monthlyReports = ref([]) as Ref<FinanceDetailsMonthlyReport[]>;
  const yearlyReports = ref([]) as Ref<FinanceDetailsYearlyReport[]>;
  const allYearsReport = ref(null) as Ref<FinanceDetailsAllYearsReport | null>;

  // Getters

  function hasReports() {
    return (
      monthlyReports.value.length > 0 ||
      yearlyReports.value.length > 0 ||
      allYearsReport.value !== null
    );
  }

  function monthlyReport(year: number, month: number) {
    return (
      monthlyReports.value.find((value) => value.year === year && value.month === month) ||
      (() => {
        throw new Error(
          `Finance Details Monthly Report ${year.toString()} - ${month.toString()} not available`,
        );
      })()
    );
  }

  function yearlyReport(year: number) {
    return (
      yearlyReports.value.find((value) => value.year === year) ||
      (() => {
        throw new Error(`Finance Details Yearly Report ${year.toString()} not available`);
      })()
    );
  }

  // Actions

  async function loadMonthlyReport(year: number, month: number) {
    if (releaseFinanceDetailsReportsTimeoutId) {
      clearTimeout(releaseFinanceDetailsReportsTimeoutId);
      releaseFinanceDetailsReportsTimeoutId = null;
    }

    if (monthlyReports.value.some((value) => value.year === year && value.month === month)) {
      return;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = date.addToDate(new Date(year, month, 1), { days: -1 });
    const content = await loadReportContent(startDate, endDate);

    const report: FinanceDetailsMonthlyReport = {
      year,
      month,
      content,
    };

    monthlyReports.value.push(report);
  }

  async function loadYearlyReport(year: number) {
    if (releaseFinanceDetailsReportsTimeoutId) {
      clearTimeout(releaseFinanceDetailsReportsTimeoutId);
      releaseFinanceDetailsReportsTimeoutId = null;
    }

    if (yearlyReports.value.some((value) => value.year === year)) {
      return;
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const content = await loadReportContent(startDate, endDate);

    const report: FinanceDetailsYearlyReport = {
      year,
      content,
    };

    yearlyReports.value.push(report);

    const cacheRecord: FinanceDetailsReportsCacheRecord = {
      year,
      beginningReceivable: content.beginningReceivable,
      beginningPayable: content.beginningPayable,
      beginningAvailableCash: content.beginningAvailableCash,
      endingReceivable: content.endingReceivable,
      endingPayable: content.endingPayable,
      endingAvailableCash: content.endingAvailableCash,
    };

    await updateCahce(cacheRecord);
  }

  async function loadAllYearsReport() {
    if (releaseFinanceDetailsReportsTimeoutId) {
      clearTimeout(releaseFinanceDetailsReportsTimeoutId);
      releaseFinanceDetailsReportsTimeoutId = null;
    }

    if (allYearsReport.value !== null) {
      return;
    }

    const years = [...useSelectDateRange().yearOptions.value].reverse();

    for (const year of years) {
      await loadYearlyReport(year);
    }

    const report: FinanceDetailsAllYearsReport = {
      years: years.map((year) => ({
        year,
        content: yearlyReport(year).content,
      })),
    };

    allYearsReport.value = report;
  }

  function releaseFinanceDetailsReports({ immediately }: ReleaseDocsActionPayload) {
    if (immediately) {
      monthlyReports.value = [];
      yearlyReports.value = [];
      allYearsReport.value = null;
    } else {
      releaseFinanceDetailsReportsTimeoutId = setTimeout(() => {
        monthlyReports.value = [];
        yearlyReports.value = [];
        allYearsReport.value = null;
      }, releaseDocsTimeout);
    }
  }

  return {
    monthlyReports,
    yearlyReports,
    allYearsReport,
    hasReports,
    monthlyReport,
    yearlyReport,
    loadMonthlyReport,
    loadYearlyReport,
    loadAllYearsReport,
    releaseFinanceDetailsReports,
  };
});
