import type { Ref } from 'vue';
import { ref } from 'vue';

import { defineStore } from 'pinia';

import { where } from 'firebase/firestore';

import { range, sortBy } from 'lodash-es';

import type {
  SalesVatInvoicesRangeReport,
  SalesVatInvoicesReport,
  SalesVatInvoicesReportDetail,
  SalesVatInvoicesYearlyReport,
} from 'models/reports/index.js';

import type { ReleaseDocsActionPayload } from 'stores/firebase-firestore/index.js';

import loadSalesContractsByVatInvoice from 'services/reports/loadSalesContractsByVatInvoice.js';

import { requiredConfigEntries } from 'composables/useConfig.js';

export const useSalesVatInvoicesReportsStore = defineStore('SalesVatInvoicesReports', () => {
  // Private

  const { releaseDocsTimeout } = requiredConfigEntries('releaseDocsTimeout');

  let releaseSalesVatInvoicesReportsTimeoutId: ReturnType<typeof setTimeout> | null = null;

  async function loadReportContent(customerId: string | undefined, startDate: Date, endDate: Date) {
    const yearOfStartDate = startDate.getFullYear();
    const yearOfEndDate = endDate.getFullYear();

    let details: SalesVatInvoicesReportDetail[];

    if (
      startDate.valueOf() === new Date(yearOfEndDate, 0, 1).valueOf() &&
      endDate.valueOf() === new Date(yearOfEndDate, 11, 31).valueOf()
    ) {
      details = await loadVatInvoices(customerId, startDate, endDate);
    } else {
      for (let year = yearOfStartDate; year <= yearOfEndDate; year++) {
        await loadYearlyReport(customerId, year);
      }

      details = range(yearOfStartDate, yearOfEndDate + 1).flatMap((year) =>
        yearlyReport(customerId, year).content.filter(
          (detail) =>
            detail.document.issueDate >= startDate && detail.document.issueDate <= endDate,
        ),
      );
    }

    const content: SalesVatInvoicesReport = details;

    return content;
  }

  async function loadVatInvoices(customerId: string | undefined, startDate: Date, endDate: Date) {
    const salesContracts = await loadSalesContractsByVatInvoice(
      startDate,
      endDate,
      ...(customerId === undefined ? [] : [where('customer.id', '==', customerId)]),
    );

    let details: SalesVatInvoicesReportDetail[] = salesContracts.flatMap((contract) =>
      contract.vatInvoices
        .filter((value) => value.issueDate >= startDate && value.issueDate <= endDate)
        .map((vatInvoice) => ({
          document: vatInvoice,
          salesContract: contract,
        })),
    );

    details = sortBy(details, (value) => value.document.code);
    details = sortBy(details, (value) => value.document.issueDate);

    return details;
  }

  // State

  const yearlyReports = ref([]) as Ref<SalesVatInvoicesYearlyReport[]>;

  // Getters

  function hasReports() {
    return yearlyReports.value.length > 0;
  }

  function yearlyReport(customerId: string | undefined, year: number) {
    return (
      yearlyReports.value.find((value) => value.customerId === customerId && value.year === year) ||
      (() => {
        throw new Error(
          `VatInvoice Yearly Report ${customerId || ''} ${year.toString()} not available`,
        );
      })()
    );
  }

  async function rangeReport(customerId: string | undefined, startDate: Date, endDate: Date) {
    let content: SalesVatInvoicesReport;
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

    const report: SalesVatInvoicesRangeReport = {
      startDate,
      endDate,
      content,
    };

    if (customerId !== undefined) {
      report.customerId = customerId;
    }

    return report;
  }

  // Actions

  async function loadYearlyReport(customerId: string | undefined, year: number) {
    if (releaseSalesVatInvoicesReportsTimeoutId) {
      clearTimeout(releaseSalesVatInvoicesReportsTimeoutId);
      releaseSalesVatInvoicesReportsTimeoutId = null;
    }

    if (
      yearlyReports.value.some((value) => value.customerId === customerId && value.year === year)
    ) {
      return;
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const content = await loadReportContent(customerId, startDate, endDate);

    const report: SalesVatInvoicesYearlyReport = {
      year,
      content,
    };

    if (customerId !== undefined) {
      report.customerId = customerId;
    }

    yearlyReports.value.push(report);
  }

  function releaseSalesVatInvoicesReports({ immediately }: ReleaseDocsActionPayload) {
    if (immediately) {
      yearlyReports.value = [];
    } else {
      releaseSalesVatInvoicesReportsTimeoutId = setTimeout(() => {
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
    releaseSalesVatInvoicesReports,
  };
});
