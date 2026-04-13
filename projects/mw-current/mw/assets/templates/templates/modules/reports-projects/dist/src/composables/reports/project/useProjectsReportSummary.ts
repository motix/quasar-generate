import { computed } from 'vue';

import { sumBy } from 'lodash-es';

import type { Project } from 'models/finance/index.js';

import useProjectCalculator from 'composables/reports/project/useProjectCalculator.js';

export default function useProjectsReportSummary(projects: Project[]) {
  // Composables

  const mc = useProjectCalculator();

  // Computed

  const totalVatExcludedInvoice = computed(() =>
    sumBy(projects, (project) => mc.projectTotalVatExcludedInvoice(project)),
  );

  const totalProductionSalary = computed(() =>
    sumBy(projects, (project) => mc.projectTotalProductionSalary(project)),
  );

  const totalExpense = computed(() =>
    sumBy(projects, (project) => mc.projectTotalExpense(project)),
  );

  const totalProfit = computed(() => sumBy(projects, (project) => mc.projectProfit(project)));

  const totalInvoice = computed(() =>
    sumBy(projects, (project) => mc.projectTotalInvoice(project)),
  );

  const totalReceipt = computed(() =>
    sumBy(projects, (project) => mc.projectTotalReceipt(project)),
  );

  const totalBalance = computed(() => sumBy(projects, (project) => mc.projectBalance(project)));

  return {
    totalVatExcludedInvoice,
    totalProductionSalary,
    totalExpense,
    totalProfit,
    totalInvoice,
    totalReceipt,
    totalBalance,
  };
}
