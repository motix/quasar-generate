import type { Ref } from 'vue';
import { ref } from 'vue';

import { defineStore } from 'pinia';

import { date } from 'quasar';

import type {
  ProjectsAllYearsReport,
  ProjectsMonthlyReport,
  ProjectsYearlyReport,
} from 'models/reports/index.js';

import type { ReleaseDocsActionPayload } from 'stores/firebase-firestore/index.js';

import loadProjects from 'services/reports/loadProjects.js';

import { requiredConfigEntries } from 'composables/useConfig.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

export const useProjectsReportsStore = defineStore('ProjectsReports', () => {
  // Private

  const { releaseDocsTimeout } = requiredConfigEntries('releaseDocsTimeout');

  let releaseProjectsReportsTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // State

  const productionMonthlyReports = ref([]) as Ref<ProjectsMonthlyReport[]>;
  const monthlyReports = ref([]) as Ref<ProjectsMonthlyReport[]>;
  const yearlyReports = ref([]) as Ref<ProjectsYearlyReport[]>;
  const allYearsReport = ref(null) as Ref<ProjectsAllYearsReport | null>;

  // Getters

  function hasReports() {
    return (
      productionMonthlyReports.value.length > 0 ||
      monthlyReports.value.length > 0 ||
      yearlyReports.value.length > 0 ||
      allYearsReport.value !== null
    );
  }

  function productionMonthlyReport(year: number, month: number) {
    return (
      productionMonthlyReports.value.find(
        (value) => value.year === year && value.month === month,
      ) ||
      (() => {
        throw new Error(
          `Projects Production Monthly Report ${year.toString()} - ${month.toString()} not available`,
        );
      })()
    );
  }

  function monthlyReport(year: number, month: number) {
    return (
      monthlyReports.value.find((value) => value.year === year && value.month === month) ||
      (() => {
        throw new Error(
          `Projects Monthly Report ${year.toString()} - ${month.toString()} not available`,
        );
      })()
    );
  }

  function yearlyReport(year: number) {
    return (
      yearlyReports.value.find((value) => value.year === year) ||
      (() => {
        throw new Error(`Projects Yearly Report ${year.toString()} not available`);
      })()
    );
  }

  // Actions

  async function loadProductionMonthlyReport(year: number, month: number) {
    if (releaseProjectsReportsTimeoutId) {
      clearTimeout(releaseProjectsReportsTimeoutId);
      releaseProjectsReportsTimeoutId = null;
    }

    if (
      productionMonthlyReports.value.some((value) => value.year === year && value.month === month)
    ) {
      return;
    }

    const { payday } = requiredConfigEntries('payday');
    const endDate = new Date(year, month - 1, payday);
    const startDate = date.addToDate(endDate, { days: 1, months: -1 });
    const projects = await loadProjects(startDate, endDate);

    const report: ProjectsMonthlyReport = {
      year,
      month,
      content: projects,
    };

    productionMonthlyReports.value.push(report);
  }

  async function loadMonthlyReport(year: number, month: number) {
    if (releaseProjectsReportsTimeoutId) {
      clearTimeout(releaseProjectsReportsTimeoutId);
      releaseProjectsReportsTimeoutId = null;
    }

    if (monthlyReports.value.some((value) => value.year === year && value.month === month)) {
      return;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = date.addToDate(new Date(year, month, 1), { days: -1 });
    const projects =
      yearlyReports.value
        .find((value) => value.year === year)
        ?.content.filter((value) => value.finishDate >= startDate && value.finishDate <= endDate) ||
      (await loadProjects(startDate, endDate));

    const report: ProjectsMonthlyReport = {
      year,
      month,
      content: projects,
    };

    monthlyReports.value.push(report);
  }

  async function loadYearlyReport(year: number) {
    if (releaseProjectsReportsTimeoutId) {
      clearTimeout(releaseProjectsReportsTimeoutId);
      releaseProjectsReportsTimeoutId = null;
    }

    if (yearlyReports.value.some((value) => value.year === year)) {
      return;
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const projects = await loadProjects(startDate, endDate);

    const report: ProjectsYearlyReport = {
      year,
      content: projects,
    };

    yearlyReports.value.push(report);
  }

  async function loadAllYearsReport() {
    if (releaseProjectsReportsTimeoutId) {
      clearTimeout(releaseProjectsReportsTimeoutId);
      releaseProjectsReportsTimeoutId = null;
    }

    if (allYearsReport.value !== null) {
      return;
    }

    const years = [...useSelectDateRange().yearOptions.value].reverse();

    for (const year of years) {
      await loadYearlyReport(year);
    }

    const report: ProjectsAllYearsReport = {
      years: years.map((year) => ({
        year,
        content: yearlyReport(year).content,
      })),
    };

    allYearsReport.value = report;
  }

  function releaseProjectsReports({ immediately }: ReleaseDocsActionPayload) {
    if (immediately) {
      productionMonthlyReports.value = [];
      monthlyReports.value = [];
      yearlyReports.value = [];
      allYearsReport.value = null;
    } else {
      releaseProjectsReportsTimeoutId = setTimeout(() => {
        productionMonthlyReports.value = [];
        monthlyReports.value = [];
        yearlyReports.value = [];
        allYearsReport.value = null;
      }, releaseDocsTimeout);
    }
  }

  return {
    productionMonthlyReports,
    monthlyReports,
    yearlyReports,
    allYearsReport,
    hasReports,
    productionMonthlyReport,
    monthlyReport,
    yearlyReport,
    loadProductionMonthlyReport,
    loadMonthlyReport,
    loadYearlyReport,
    loadAllYearsReport,
    releaseProjectsReports,
  };
});
