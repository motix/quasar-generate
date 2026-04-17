import type { Ref } from 'vue';
import { ref } from 'vue';

import { defineStore } from 'pinia';

import { where } from 'firebase/firestore';

import { range, sortBy } from 'lodash-es';

import type { Invoice, Transaction } from 'models/finance/index.js';
import type {
  CustomerRangeReport,
  CustomerReport,
  CustomerReportDetail,
  CustomerYearlyReport,
} from 'models/reports/index.js';

import type { ReleaseDocsActionPayload } from 'stores/firebase-firestore/index.js';

import loadFinanceDetailsByTransaction from 'services/reports/loadFinanceDetailsByTransaction.js';
import loadGeneralInvoices from 'services/reports/loadGeneralInvoices.js';
import loadProjects from 'services/reports/loadProjects.js';

import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';
import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

export const useCustomersReportsStore = defineStore('CustomersReports', () => {
  // Private

  const { releaseDocsTimeout } = requiredConfigEntries('releaseDocsTimeout');

  let releaseCustomersReportsTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const ic = useInvoiceCalculator<Invoice>();
  const tc = useTransactionCalculator<Transaction>();

  async function loadReportContent(customerId: string, startDate: Date, endDate: Date) {
    const yearOfStartDate = startDate.getFullYear();
    const yearOfEndDate = endDate.getFullYear();

    const years = useSelectDateRange().yearOptions.value;

    if (yearOfStartDate > years[years.length - 1]!) {
      await loadYearlyReport(customerId, yearOfStartDate - 1);
    }

    let details: CustomerReportDetail[];

    let beginningBalance: number;

    if (
      startDate.valueOf() === new Date(yearOfEndDate, 0, 1).valueOf() &&
      endDate.valueOf() === new Date(yearOfEndDate, 11, 31).valueOf()
    ) {
      details = await loadCustomerDetails(customerId, startDate, endDate);

      beginningBalance =
        yearOfStartDate === years[years.length - 1]
          ? 0
          : yearlyReport(customerId, yearOfStartDate - 1).content.endingBalance;

      for (let i = 0; i < details.length; i++) {
        if (i === 0) {
          processDetail(details[i]!, beginningBalance);
        } else {
          processDetail(details[i]!, details[i - 1]!.balance);
        }
      }
    } else {
      for (let year = yearOfStartDate; year <= yearOfEndDate; year++) {
        await loadYearlyReport(customerId, year);
      }

      details = range(yearOfStartDate, yearOfEndDate + 1).flatMap((year) =>
        yearlyReport(customerId, year).content.details.filter(
          (detail) =>
            detail.document.issueDate >= startDate && detail.document.issueDate <= endDate,
        ),
      );

      const sameYearOfStartDateEarlierDetails = yearlyReport(
        customerId,
        yearOfStartDate,
      ).content.details.filter((detail) => detail.document.issueDate < startDate);

      if (sameYearOfStartDateEarlierDetails.length === 0) {
        beginningBalance = yearlyReport(customerId, yearOfStartDate).content.beginningBalance;
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

    const content: CustomerReport = {
      beginningBalance,
      details,
      endingBalance,
    };

    return content;

    function processDetail(detail: CustomerReportDetail, previousBalance: number) {
      if (detail.document === detail.invoice) {
        detail.invoiceAmount = ic.invoiceTotal(detail.invoice);
      } else if (detail.document === detail.transaction) {
        detail.receiptAmount =
          tc.transactionTotal(detail.transaction) *
          (tc.transactionNegative(detail.transaction) ? -1 : 1);
      }

      detail.invoiceBalance = ic.invoiceBalance(detail.invoice);

      detail.balance = previousBalance + (detail.invoiceAmount || 0) - (detail.receiptAmount || 0);

      detail.balanceIncreased = detail.balance > previousBalance;
      detail.balanceDecreased = detail.balance < previousBalance;
    }
  }

  async function loadCustomerDetails(customerId: string, startDate: Date, endDate: Date) {
    const projects = await loadProjects(startDate, endDate, where('customer.id', '==', customerId));
    const generalInvoices = await loadGeneralInvoices(
      startDate,
      endDate,
      where('customer.id', '==', customerId),
    );
    const detailsByTransaction = await loadFinanceDetailsByTransaction(
      startDate,
      endDate,
      where('customerId', '==', customerId),
    );

    const defaultValues: Pick<
      CustomerReportDetail,
      'invoiceBalance' | 'balance' | 'balanceIncreased' | 'balanceDecreased'
    > = {
      invoiceBalance: 0,
      balance: 0,
      balanceIncreased: false,
      balanceDecreased: false,
    };

    let details: CustomerReportDetail[] = [
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
    ];

    details = sortBy(details, (value) => value.document.createDate);
    details = sortBy(details, (value) => value.document.issueDate);

    return details;
  }

  // State

  const yearlyReports = ref([]) as Ref<CustomerYearlyReport[]>;

  // Getters

  function hasReports() {
    return yearlyReports.value.length > 0;
  }

  function yearlyReport(customerId: string, year: number) {
    return (
      yearlyReports.value.find((value) => value.customerId === customerId && value.year === year) ||
      (() => {
        throw new Error(`Customer Yearly Report ${customerId} ${year.toString()} not available`);
      })()
    );
  }

  async function rangeReport(customerId: string, startDate: Date, endDate: Date) {
    let content: CustomerReport;
    const yearOfEndDate = endDate.getFullYear();

    if (
      startDate.valueOf() === new Date(yearOfEndDate, 0, 1).valueOf() &&
      endDate.valueOf() === new Date(yearOfEndDate, 11, 31).valueOf()
    ) {
      await loadYearlyReport(customerId, yearOfEndDate);
      content = yearlyReport(customerId, yearOfEndDate).content;
    } else {
      content = await loadReportContent(customerId, startDate, endDate);
    }

    const report: CustomerRangeReport = {
      customerId,
      startDate,
      endDate,
      content,
    };

    return report;
  }

  // Actions

  async function loadYearlyReport(customerId: string, year: number) {
    if (releaseCustomersReportsTimeoutId) {
      clearTimeout(releaseCustomersReportsTimeoutId);
      releaseCustomersReportsTimeoutId = null;
    }

    if (
      yearlyReports.value.some((value) => value.customerId === customerId && value.year === year)
    ) {
      return;
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const content = await loadReportContent(customerId, startDate, endDate);

    const report: CustomerYearlyReport = {
      customerId,
      year,
      content,
    };

    yearlyReports.value.push(report);
  }

  function releaseCustomersReports({ immediately }: ReleaseDocsActionPayload) {
    if (immediately) {
      yearlyReports.value = [];
    } else {
      releaseCustomersReportsTimeoutId = setTimeout(() => {
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
    releaseCustomersReports,
  };
});
