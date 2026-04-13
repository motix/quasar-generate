<script setup lang="ts">
import { computed } from 'vue';

import { Dark } from 'quasar';

import type { ApexOptions } from 'apexcharts';

import type { Project } from 'models/finance/index.js';

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
    dataLabels: {
      formatter: (value) => f.currency(Math.round((value as number) / 1000000)) + 'm',
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: -10,
      },
    },
    legend: {
      position: 'top',
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    stroke: {
      width: 1,
    },
    theme: {
      mode: Dark.isActive ? 'dark' : 'light',
    },
    tooltip: {
      theme: Dark.isActive ? 'dark' : 'light',
      y: {
        formatter: (value) => f.currency(value) || '',
      },
    },
    xaxis: {
      labels: {
        rotate: 45,
        rotateAlways: true,
        minHeight: 60,
        offsetY: 30,
        formatter: (value) => f.currency(Math.round(Number(value) / 1000000)) + 'm',
      },
      position: 'top',
    },
    yaxis: {
      labels: {
        maxWidth: 300,
      },
    },
  }),
);

// Props

const props = defineProps<{ projects: Project[] }>();

// Composables

const f = useFormats();

const mc = useProjectCalculator();

// Computed

const chartHeight = computed(() => props.projects.length * 35 + 100);

const profitChartOptions = computed(
  () =>
    ({
      ...chartOptions.value,
      theme: {
        palette: 'palette2',
      },
      labels: props.projects.map((value) => value.name),
    }) as ApexOptions,
);

const balanceChartOptions = computed(
  () =>
    ({
      ...chartOptions.value,
      theme: {
        palette: 'palette2',
      },
      labels: props.projects.map((value) => value.name),
    }) as ApexOptions,
);

const profitChartSeries = computed(() => [
  {
    name: 'Production Salary',
    data: props.projects.map((value) => mc.projectTotalProductionSalary(value)),
  },
  {
    name: 'Expense',
    data: props.projects.map((value) => mc.projectTotalExpense(value)),
  },
  {
    name: 'Profit',
    data: props.projects.map((value) => mc.projectProfit(value)),
  },
]);

const balanceChartSeries = computed(() => [
  {
    name: 'Received',
    data: props.projects.map((value) => mc.projectTotalReceipt(value)),
  },
  {
    name: 'Balance',
    data: props.projects.map((value) => mc.projectBalance(value)),
  },
]);
</script>

<template>
  <div>
    <h4 class="text-weight-light">Profit</h4>

    <Apex-Charts
      :height="chartHeight"
      :options="profitChartOptions"
      :series="profitChartSeries"
      type="bar"
    />

    <h4 class="text-weight-light">Balance</h4>

    <Apex-Charts
      :height="chartHeight"
      :options="balanceChartOptions"
      :series="balanceChartSeries"
      type="bar"
    />
  </div>
</template>
