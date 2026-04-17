<script setup lang="ts">
import { computed } from 'vue';

import { Dark } from 'quasar';

import type { ApexOptions } from 'apexcharts';
import { sumBy } from 'lodash-es';

import type { Project } from 'models/finance/index.js';

import useProjectCalculator from 'composables/reports/project/useProjectCalculator.js';
import useFormats from 'composables/useFormats.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

// Private

const chartOptions = computed(
  (): ApexOptions => ({
    chart: {
      background: 'transparent',
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    legend: {
      position: 'top',
    },
    stroke: {
      width: 1,
      curve: 'smooth',
    },
    theme: {
      mode: Dark.isActive ? 'dark' : 'light',
    },
    tooltip: {
      theme: Dark.isActive ? 'dark' : 'light',
    },
    yaxis: {
      min: 0,
      max: (value) => {
        return Math.ceil((value * 1.1) / 1000000) * 1000000;
      },
      labels: {
        formatter: (value) => f.currency(value) || '',
      },
    },
  }),
);

const projectsByMonth = computed(() => {
  const months = useSelectDateRange().monthOptions.value;

  return months.map((month) =>
    props.projects.filter((project) => project.finishDate.getMonth() === month - 1),
  );
});

// Props

const props = defineProps<{ projects: Project[] }>();

// Composables

const f = useFormats();

const mc = useProjectCalculator();

// Computed

const chartHeight = computed(() => (window.innerHeight / 3) * 2);

const profitChartOptions = computed(
  () =>
    ({
      ...chartOptions.value,
      theme: {
        palette: 'palette2',
      },
    }) as ApexOptions,
);

const balanceChartOptions = computed(
  () =>
    ({
      ...chartOptions.value,
      theme: {
        palette: 'palette2',
      },
    }) as ApexOptions,
);

const profitChartSeries = computed(() => [
  {
    name: 'VAT Excluded Invoice',
    type: 'area',
    group: 'sum',
    data: projectsByMonth.value.map((projects) =>
      sumBy(projects, (project) => mc.projectTotalVatExcludedInvoice(project)),
    ),
  },
  {
    name: 'Production Salary',
    type: 'bar',
    data: projectsByMonth.value.map((projects) =>
      sumBy(projects, (project) => mc.projectTotalProductionSalary(project)),
    ),
  },
  {
    name: 'Expense',
    type: 'bar',
    data: projectsByMonth.value.map((projects) =>
      sumBy(projects, (project) => mc.projectTotalExpense(project)),
    ),
  },
  {
    name: 'Profit',
    type: 'bar',
    data: projectsByMonth.value.map((projects) =>
      sumBy(projects, (project) => mc.projectProfit(project)),
    ),
  },
]);

const balanceChartSeries = computed(() => [
  {
    name: 'VAT Included Invoice',
    type: 'area',
    group: 'sum',
    data: projectsByMonth.value.map((projects) =>
      sumBy(projects, (project) => mc.projectTotalInvoice(project)),
    ),
  },
  {
    name: 'Received',
    type: 'bar',
    data: projectsByMonth.value.map((projects) =>
      sumBy(projects, (project) => mc.projectTotalReceipt(project)),
    ),
  },
  {
    name: 'Balance',
    type: 'bar',
    data: projectsByMonth.value.map((projects) =>
      sumBy(projects, (project) => mc.projectBalance(project)),
    ),
  },
]);
</script>

<template>
  <div>
    <h4 class="text-weight-light">Profit</h4>

    <Apex-Charts :height="chartHeight" :options="profitChartOptions" :series="profitChartSeries" />

    <h4 class="text-weight-light">Balance</h4>

    <Apex-Charts
      :height="chartHeight"
      :options="balanceChartOptions"
      :series="balanceChartSeries"
    />
  </div>
</template>
