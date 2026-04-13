import type { Ref } from 'vue';
import { ref } from 'vue';

import { defineStore } from 'pinia';

import { range, sortBy, sumBy, uniqBy } from 'lodash-es';

import type { Invoice, Transaction } from 'models/finance/index.js';
import type {
  InvoicesRangeReport,
  InvoicesReport,
  InvoicesReportDetail,
  InvoicesYearlyReport,
} from 'models/reports/index.js';

import type { ReleaseDocsActionPayload } from 'stores/firebase-firestore/index.js';

import loadGeneralInvoices from 'services/reports/loadGeneralInvoices.js';
import loadProjects from 'services/reports/loadProjects.js';

import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';
import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

export const useInvoicesReportsStore = defineStore('InvoicesReport', () => {
  // Private

  const { releaseDocsTimeout } = requiredConfigEntries('releaseDocsTimeout');

  let releaseInvoicesReportsTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const ic = useInvoiceCalculator<Invoice>();
  const tc = useTransactionCalculator<Transaction>();

  async function loadReportContent(startDate: Date, endDate: Date) {
    const yearOfStartDate = startDate.getFullYear();
    const yearOfEndDate = endDate.getFullYear();

    const years = useSelectDateRange().yearOptions.value;

    if (yearOfStartDate > years[years.length - 1]!) {
      await loadYearlyReport(yearOfStartDate - 1);
    }

    let details: InvoicesReportDetail[];

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
          (detail) => detail.invoice.issueDate >= startDate && detail.invoice.issueDate <= endDate,
        ),
      );
    }

    const content: InvoicesReport = {
      details,
      financeAccounts: buildFinanceAccountsFromDetails(details),
      invoiceGroups: buildInvoiceGroupsFromDetails(details),
    };

    return content;

    function processDetail(detail: InvoicesReportDetail) {
      const transactions = detail.invoice.transactions.filter(
        (value) => value.isCleared && !value.isCancelled,
      );

      let financeAccounts = transactions.flatMap((transaction) => [
        ...(transaction.sourceFinanceAccount ? [transaction.sourceFinanceAccount] : []),
        ...(transaction.destinationFinanceAccount ? [transaction.destinationFinanceAccount] : []),
      ]);

      financeAccounts = uniqBy(financeAccounts, (value) => value.id);

      financeAccounts.forEach((financeAccount) => {
        detail.totalReceiptByFinanceAccount[financeAccount.id] =
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

    function buildFinanceAccountsFromDetails(details: InvoicesReportDetail[]) {
      let financeAccounts = details
        .flatMap((detail) =>
          detail.invoice.transactions.filter((value) => value.isCleared && !value.isCancelled),
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

    function buildInvoiceGroupsFromDetails(details: InvoicesReportDetail[]) {
      let invoiceGroups = details.flatMap((detail) =>
        detail.invoice.group ? [detail.invoice.group] : [],
      );

      invoiceGroups = sortBy(
        uniqBy(invoiceGroups, (value) => value.id),
        (value) => value.name,
      );

      return invoiceGroups;
    }
  }

  async function loadDetails(startDate: Date, endDate: Date) {
    let projects = await loadProjects(startDate, endDate);
    let generalInvoices = await loadGeneralInvoices(startDate, endDate);

    projects = projects.filter((project) =>
      project.quotations.some(
        (quotation) =>
          !!quotation.invoice && quotation.invoice.isCompleted && !quotation.invoice.isCancelled,
      ),
    );
    generalInvoices = generalInvoices.filter(
      (invoice) => invoice.isCompleted && !invoice.isCancelled,
    );

    let details: InvoicesReportDetail[] = [
      ...projects.flatMap((project) =>
        project.quotations
          .flatMap((quotation) => (quotation.invoice ? [quotation.invoice] : []))
          .filter((invoice) => invoice.isCompleted && !invoice.isCancelled)
          .map((invoice) => ({
            invoice,
            project,
            total: ic.invoiceTotal(invoice),
            totalReceipt: ic.invoiceTotalReceipt(invoice),
            balance: ic.invoiceBalance(invoice),
            totalReceiptByFinanceAccount: {},
          })),
      ),
      ...generalInvoices.map((invoice) => ({
        invoice,
        total: ic.invoiceTotal(invoice),
        totalReceipt: ic.invoiceTotalReceipt(invoice),
        balance: ic.invoiceBalance(invoice),
        totalReceiptByFinanceAccount: {},
      })),
    ];

    details = sortBy(details, (value) => value.invoice.issueDate);

    return details;
  }

  // State

  const yearlyReports = ref([]) as Ref<InvoicesYearlyReport[]>;

  // Getters

  function hasReports() {
    return yearlyReports.value.length > 0;
  }

  function yearlyReport(year: number) {
    return (
      yearlyReports.value.find((value) => value.year === year) ||
      (() => {
        throw new Error(`Invoices Report ${year.toString()} not available`);
      })()
    );
  }

  async function rangeReport(startDate: Date, endDate: Date) {
    let content: InvoicesReport;
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

    const report: InvoicesRangeReport = {
      startDate,
      endDate,
      content,
    };

    return report;
  }

  // Actions

  async function loadYearlyReport(year: number) {
    if (releaseInvoicesReportsTimeoutId) {
      clearTimeout(releaseInvoicesReportsTimeoutId);
      releaseInvoicesReportsTimeoutId = null;
    }

    if (yearlyReports.value.some((value) => value.year === year)) {
      return;
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const content = await loadReportContent(startDate, endDate);

    const report: InvoicesYearlyReport = {
      year,
      content,
    };

    yearlyReports.value.push(report);
  }

  function releaseInvoicesReports({ immediately }: ReleaseDocsActionPayload) {
    if (immediately) {
      yearlyReports.value = [];
    } else {
      releaseInvoicesReportsTimeoutId = setTimeout(() => {
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
    releaseInvoicesReports,
  };
});
