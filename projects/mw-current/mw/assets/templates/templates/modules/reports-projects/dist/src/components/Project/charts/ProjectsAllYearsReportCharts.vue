<script setup lang="ts">
import { computed } from 'vue';

import { Dark } from 'quasar';

import type { ApexOptions } from 'apexcharts';
import { sumBy } from 'lodash-es';

import type { ProjectsAllYearsReport } from 'models/reports/index.js';

import useProjectCalculator from 'composables/reports/project/useProjectCalculator.js';
import useFormats from 'composables/useFormats.js';

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

// Props

const props = defineProps<{ years: ProjectsAllYearsReport['years'] }>();

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
      labels: props.years.map((value) => value.year.toString()),
    }) as ApexOptions,
);

const balanceChartOptions = computed(
  () =>
    ({
      ...chartOptions.value,
      theme: {
        palette: 'palette2',
      },
      labels: props.years.map((value) => value.year.toString()),
    }) as ApexOptions,
);

const profitChartSeries = computed(() => [
  {
    name: 'VAT Excluded Invoice',
    type: 'area',
    group: 'sum',
    data: props.years.map((year) =>
      sumBy(year.content, (project) => mc.projectTotalVatExcludedInvoice(project)),
    ),
  },
  {
    name: 'Production Salary',
    type: 'bar',
    data: props.years.map((year) =>
      sumBy(year.content, (project) => mc.projectTotalProductionSalary(project)),
    ),
  },
  {
    name: 'Expense',
    type: 'bar',
    data: props.years.map((year) =>
      sumBy(year.content, (project) => mc.projectTotalExpense(project)),
    ),
  },
  {
    name: 'Profit',
    type: 'bar',
    data: props.years.map((year) => sumBy(year.content, (project) => mc.projectProfit(project))),
  },
]);

const balanceChartSeries = computed(() => [
  {
    name: 'VAT Included Invoice',
    type: 'area',
    group: 'sum',
    data: props.years.map((year) =>
      sumBy(year.content, (project) => mc.projectTotalInvoice(project)),
    ),
  },
  {
    name: 'Received',
    type: 'bar',
    data: props.years.map((year) =>
      sumBy(year.content, (project) => mc.projectTotalReceipt(project)),
    ),
  },
  {
    name: 'Balance',
    type: 'bar',
    data: props.years.map((year) => sumBy(year.content, (project) => mc.projectBalance(project))),
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
