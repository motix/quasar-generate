<script setup lang="ts">
import { computed } from 'vue';

import { Dark } from 'quasar';

import type { ApexOptions } from 'apexcharts';
import { sumBy } from 'lodash-es';

import type { FinanceDetailsReport } from 'models/reports/index.js';

import useFormats from 'composables/useFormats.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

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
      labels: {
        formatter: (value) => f.currency(value) || '',
      },
    },
  }),
);

const detailsByMonth = computed(() => {
  const months = useSelectDateRange().monthOptions.value;

  return months.map((month) =>
    props.content.details.filter((dettail) => dettail.document.issueDate.getMonth() === month - 1),
  );
});

// Props

const props = defineProps<{ content: FinanceDetailsReport }>();

// Composables

const f = useFormats();

// Computed

const chartHeight = computed(() => (window.innerHeight / 3) * 2);

const invoiceChartOptions = computed(
  () =>
    ({
      ...chartOptions.value,
      colors: ['#81D4FA', '#3F51B5', '#008FFB'],
    }) as ApexOptions,
);

const expenseChartOptions = computed(
  () =>
    ({
      ...chartOptions.value,
      colors: ['#FFDE00', '#FF9800', '#F9C80E'],
    }) as ApexOptions,
);

const cashChartOptions = computed(
  () =>
    ({
      ...chartOptions.value,
      stroke: {
        width: [3, 3, 3, 3, 1, 1, 1],
        curve: 'straight',
      },
      colors: ['#81D4FA', '#FFDE00', '#3F51B5', '#FF9800', '#008FFB', '#F9C80E', '#4CAF50'],
    }) as ApexOptions,
);

const invoiceChartSeries = computed(() => [
  {
    name: 'Non-business Invoice',
    type: 'bar',
    data: detailsByMonth.value.map((details) =>
      sumBy(details, (detail) =>
        detail.document !== detail.invoice ||
        (!detail.invoice.isCapitalContribution && !detail.invoice.isExternal)
          ? 0
          : detail.invoiceAmount || 0,
      ),
    ),
  },
  {
    name: 'Business Invoice',
    type: 'bar',
    data: detailsByMonth.value.map((details) =>
      sumBy(details, (detail) =>
        detail.document !== detail.invoice ||
        detail.invoice.isCapitalContribution ||
        detail.invoice.isExternal
          ? 0
          : detail.invoiceAmount || 0,
      ),
    ),
  },
  {
    name: 'Received',
    type: 'bar',
    data: detailsByMonth.value.map((details) =>
      sumBy(details, (detail) =>
        detail.document !== detail.transaction ||
        (detail.transaction.type !== 'Receipt' && detail.transaction.type !== 'Receipt Refund')
          ? 0
          : detail.receiptAmount || 0,
      ),
    ),
  },
]);

const expenseChartSeries = computed(() => [
  {
    name: 'Non-business Expense',
    type: 'bar',
    data: detailsByMonth.value.map((details) =>
      sumBy(details, (detail) =>
        detail.document !== detail.expense ||
        (!detail.expense.isCapitalWithdrawal && !detail.expense.isExternal)
          ? 0
          : detail.expenseAmount || 0,
      ),
    ),
  },
  {
    name: 'Business Expense',
    type: 'bar',
    data: detailsByMonth.value.map((details) =>
      sumBy(details, (detail) =>
        detail.document !== detail.expense ||
        detail.expense.isCapitalWithdrawal ||
        detail.expense.isExternal
          ? 0
          : detail.expenseAmount || 0,
      ),
    ),
  },
  {
    name: 'Paid',
    type: 'bar',
    data: detailsByMonth.value.map((details) =>
      sumBy(details, (detail) =>
        detail.document !== detail.transaction ||
        (detail.transaction.type !== 'Payment' && detail.transaction.type !== 'Payment Refund')
          ? 0
          : detail.paymentAmount || 0,
      ),
    ),
  },
]);

const cashChartSeries = computed(() => [
  // Capital Contribution
  {
    name: invoiceChartSeries.value[0]!.name,
    type: 'line',
    data: invoiceChartSeries.value[0]!.data,
  },
  // Capital Withdrawal
  {
    name: expenseChartSeries.value[0]!.name,
    type: 'line',
    data: expenseChartSeries.value[0]!.data,
  },
  // Invoice
  {
    name: invoiceChartSeries.value[1]!.name,
    type: 'line',
    data: invoiceChartSeries.value[1]!.data,
  },
  // Expense
  {
    name: expenseChartSeries.value[1]!.name,
    type: 'line',
    data: expenseChartSeries.value[1]!.data,
  },
  {
    name: 'Receivable',
    type: 'bar',
    data: detailsByMonth.value.map((details, index) => {
      while (details.length === 0 && index > 0) {
        index--;
        details = detailsByMonth.value[index]!;
      }

      if (details.length === 0) {
        return props.content.beginningReceivable;
      }

      return details[details.length - 1]!.receivable;
    }),
  },
  {
    name: 'Payable',
    type: 'bar',
    data: detailsByMonth.value.map((details, index) => {
      while (details.length === 0 && index > 0) {
        index--;
        details = detailsByMonth.value[index]!;
      }

      if (details.length === 0) {
        return props.content.beginningPayable;
      }

      return details[details.length - 1]!.payable;
    }),
  },
  {
    name: 'Available Cash',
    type: 'bar',
    data: detailsByMonth.value.map((details, index) => {
      while (details.length === 0 && index > 0) {
        index--;
        details = detailsByMonth.value[index]!;
      }

      if (details.length === 0) {
        return props.content.beginningAvailableCash;
      }

      return details[details.length - 1]!.availableCash;
    }),
  },
]);
</script>

<template>
  <div>
    <h4 class="text-weight-light">Invoice</h4>

    <Apex-Charts
      :height="chartHeight"
      :options="invoiceChartOptions"
      :series="invoiceChartSeries"
    />

    <h4 class="text-weight-light">Expense</h4>

    <Apex-Charts
      :height="chartHeight"
      :options="expenseChartOptions"
      :series="expenseChartSeries"
    />

    <h4 class="text-weight-light">Cash</h4>

    <Apex-Charts :height="chartHeight" :options="cashChartOptions" :series="cashChartSeries" />
  </div>
</template>
