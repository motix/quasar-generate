import type { Ref } from 'vue';
import { ref } from 'vue';

import { defineStore } from 'pinia';

import { sortBy, sumBy, uniqBy } from 'lodash-es';

import type { Expense } from 'models/finance/index.js';
import type { PayableReport, PayableReportDetail } from 'models/reports/index.js';

import type { ReleaseDocsActionPayload } from 'stores/firebase-firestore/index.js';

import loadGeneralExpenses from 'services/reports/loadGeneralExpenses.js';
import loadProjects from 'services/reports/loadProjects.js';

import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

export const usePayableReportStore = defineStore('PayableReport', () => {
  // Private

  const { releaseDocsTimeout } = requiredConfigEntries('releaseDocsTimeout');

  let releasePayableReportTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const years = useSelectDateRange().yearOptions.value;
  const startDate = new Date(years[years.length - 1]!, 0, 1);
  const endDate = new Date(years[0]!, 11, 31);

  const ec = useExpenseCalculator<Expense>();

  async function loadReportContent() {
    let projects = await loadProjects(startDate, endDate);
    let generalExpenses = await loadGeneralExpenses(startDate, endDate);

    projects = projects.filter((project) => {
      project.expenses = project.expenses.filter(
        (expense) =>
          expense.isCompleted && !expense.isCancelled && ec.expenseBalance(expense) !== 0,
      );

      return project.expenses.length > 0;
    });
    generalExpenses = generalExpenses.filter((value) => ec.expenseBalance(value) !== 0);

    let suppliers = [
      ...projects.flatMap((project) => project.expenses).map((value) => value.supplier),
      ...generalExpenses.map((value) => value.supplier),
    ];

    suppliers = uniqBy(suppliers, (value) => value.id);
    suppliers = sortBy(suppliers, (value) => value.name);

    const details: PayableReportDetail[] = suppliers.map((supplier) => {
      const supplierProjects = projects
        .filter((project) =>
          project.expenses.some((expense) => expense.supplier.id === supplier.id),
        )
        .map((project) => ({
          ...project,
          expenses: project.expenses.filter((value) => value.supplier.id === supplier.id),
        }));

      const supplierGeneralExpenses = generalExpenses.filter(
        (value) => value.supplier.id === supplier.id,
      );

      const balance =
        sumBy(supplierProjects, (project) =>
          sumBy(project.expenses, (value) => ec.expenseBalance(value)),
        ) + sumBy(supplierGeneralExpenses, (value) => ec.expenseBalance(value));

      const detail = {
        supplier,
        projects: supplierProjects,
        generalExpenses: supplierGeneralExpenses,
        balance,
      };

      return detail;
    });

    const content: PayableReport = details;

    return content;
  }

  // State

  const report = ref(null) as Ref<PayableReport | null>;

  // Getters

  function hasReports() {
    return report.value !== null;
  }

  // Actions

  async function loadReport() {
    if (releasePayableReportTimeoutId) {
      clearTimeout(releasePayableReportTimeoutId);
      releasePayableReportTimeoutId = null;
    }

    if (report.value !== null) {
      return;
    }

    report.value = await loadReportContent();
  }

  function releasePayableReport({ immediately }: ReleaseDocsActionPayload) {
    if (immediately) {
      report.value = null;
    } else {
      releasePayableReportTimeoutId = setTimeout(() => {
        report.value = null;
      }, releaseDocsTimeout);
    }
  }

  return {
    report,
    hasReports,
    loadReport,
    releasePayableReport,
  };
});
