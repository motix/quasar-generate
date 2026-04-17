import type { Ref } from 'vue';
import { ref } from 'vue';

import { defineStore } from 'pinia';

import { sortBy, sumBy, uniqBy } from 'lodash-es';

import type { Invoice } from 'models/finance/index.js';
import type { ReceivableReport, ReceivableReportDetail } from 'models/reports/index.js';

import type { ReleaseDocsActionPayload } from 'stores/firebase-firestore/index.js';

import loadGeneralInvoices from 'services/reports/loadGeneralInvoices.js';
import loadProjects from 'services/reports/loadProjects.js';

import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';
import useProjectCalculator from 'composables/reports/project/useProjectCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

export const useReceivableReportStore = defineStore('ReceivableReport', () => {
  // Private

  const { releaseDocsTimeout } = requiredConfigEntries('releaseDocsTimeout');

  let releaseReceivableReportTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const years = useSelectDateRange().yearOptions.value;
  const startDate = new Date(years[years.length - 1]!, 0, 1);
  const endDate = new Date(years[0]!, 11, 31);

  const pc = useProjectCalculator();
  const ic = useInvoiceCalculator<Invoice>();

  async function loadReportContent() {
    let projects = await loadProjects(startDate, endDate);
    let generalInvoices = await loadGeneralInvoices(startDate, endDate);

    projects = projects.filter((value) => pc.projectBalance(value) !== 0);
    generalInvoices = generalInvoices.filter((value) => ic.invoiceBalance(value) !== 0);

    let customers = [
      ...projects.map((value) => value.customer),
      ...generalInvoices.map((value) => value.customer),
    ];

    customers = uniqBy(customers, (value) => value.id);
    customers = sortBy(customers, (value) => value.name);

    const details: ReceivableReportDetail[] = customers.map((customer) => {
      const customerProjects = projects.filter((value) => value.customer.id === customer.id);

      const customerGeneralInvoices = generalInvoices.filter(
        (value) => value.customer.id === customer.id,
      );

      const balance =
        sumBy(customerProjects, (value) => pc.projectBalance(value)) +
        sumBy(customerGeneralInvoices, (value) => ic.invoiceBalance(value));

      const detail = {
        customer,
        projects: customerProjects,
        generalInvoices: customerGeneralInvoices,
        balance,
      };

      return detail;
    });

    const content: ReceivableReport = details;

    return content;
  }

  // State

  const report = ref(null) as Ref<ReceivableReport | null>;

  // Getters

  function hasReports() {
    return report.value !== null;
  }

  // Actions

  async function loadReport() {
    if (releaseReceivableReportTimeoutId) {
      clearTimeout(releaseReceivableReportTimeoutId);
      releaseReceivableReportTimeoutId = null;
    }

    if (report.value !== null) {
      return;
    }

    report.value = await loadReportContent();
  }

  function releaseReceivableReport({ immediately }: ReleaseDocsActionPayload) {
    if (immediately) {
      report.value = null;
    } else {
      releaseReceivableReportTimeoutId = setTimeout(() => {
        report.value = null;
      }, releaseDocsTimeout);
    }
  }

  return {
    report,
    hasReports,
    loadReport,
    releaseReceivableReport,
  };
});
