<script setup lang="ts">
import { computed } from 'vue';

import { Dark } from 'quasar';

import type { ApexOptions } from 'apexcharts';

import type { ReceivableReport } from 'models/reports/index.js';

import useFormats from 'composables/useFormats.js';

// Private

const chartOptions = computed(
  (): ApexOptions => ({
    chart: {
      background: 'transparent',
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

const props = defineProps<{ report: ReceivableReport }>();

// Composables

const f = useFormats();

// Computed

const chartHeight = computed(() => props.report.length * 35 + 85);

const receivableChartOptions = computed(
  () =>
    ({
      ...chartOptions.value,
      theme: {
        palette: 'palette2',
      },
      labels: props.report.map((value) => value.customer.name),
    }) as ApexOptions,
);

const receivableChartSeries = computed(() => [
  {
    name: 'Balance',
    data: props.report.map((value) => value.balance),
  },
]);
</script>

<template>
  <div>
    <h4 class="text-weight-light">Receivable</h4>

    <Apex-Charts
      :height="chartHeight"
      :options="receivableChartOptions"
      :series="receivableChartSeries"
      type="bar"
    />
  </div>
</template>
