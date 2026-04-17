<script lang="ts">
import type { Ref } from 'vue';
import { computed, onUnmounted, ref } from 'vue';

import { Dark } from 'quasar';

import type { ReceivableReport } from 'models/reports/index.js';

import { useReceivableReportStore } from 'stores/reports/ReceivableReport.js';

import useCharts from 'composables/useCharts.js';
import useMultiViews from 'composables/useMultiViews.js';
import useNotifications from 'composables/useNotifications.js';

import ReceivableReportCards from 'components/Receivable/cards/ReceivableReportCards.vue';
import ReceivableReportChart from 'components/Receivable/charts/ReceivableReportChart.vue';
import ReceivableReportTable from 'components/Receivable/table/ReceivableReportTable.vue';
import FloatToolbar from 'components/shared/FloatToolbar.vue';
import SwitchViewButton from 'components/shared/SwitchViewButton.vue';
import ToggleChartsViewButton from 'components/shared/ToggleChartsViewButton.vue';

function usePageStatus() {
  // Data

  const ready = ref(false);

  return {
    ready,
  };
}

function usePageData(ready: ReturnType<typeof usePageStatus>['ready']) {
  // Composables

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  const store = useReceivableReportStore();

  // Data

  const report = ref(null) as Ref<ReceivableReport | null>;

  // Computed

  const hasReport = computed(() => store.hasReports());

  // Methods

  function loadReport() {
    ready.value = false;
    report.value = null;

    store
      .loadReport()
      .then(() => {
        // Casting is requried as DocumentStatus contains private fields
        // See https://github.com/vuejs/core/issues/2981
        report.value = store.report as ReceivableReport;
        ready.value = true;
      })
      .catch((error) => {
        console.error(error);
        notifyLoadDataError();
        notifyErrorDebug(error);
        ready.value = true;
      });
  }

  function refresh() {
    store.releaseReceivableReport({ immediately: true });
    loadReport();
  }

  // Lifecycle Hooks

  onUnmounted(() => {
    store.releaseReceivableReport({ immediately: false });
  });

  return {
    report,
    hasReport,
    loadReport,
    refresh,
  };
}
</script>

<script setup lang="ts">
// Composables

const { isTableView, isCardsView } = useMultiViews();

const { ready } = usePageStatus();

const { report, hasReport, loadReport, refresh } = usePageData(ready);

const { isChartsView } = useCharts();

//  Private Executions

setTimeout(() => {
  loadReport();
}, 500);
</script>

<template>
  <QPagePadding padding>
    <FadeTransition>
      <div v-if="!ready" key="loading" class="absolute-center">
        <!-- Loading -->
        <q-spinner-pie color="primary" size="6em" />
      </div>

      <div v-else-if="!report" key="empty">
        <!-- Empty -->
        <div class="q-my-md text-center">The data is not available. Please contact support.</div>
      </div>

      <div v-else key="ready">
        <!-- Ready -->
        <FadeTransition>
          <div v-if="report.length === 0" key="empty" class="text-center">
            There is no current receivable.
          </div>
          <ReceivableReportTable
            v-else-if="!isChartsView && isTableView"
            key="tableView"
            :report="report"
          />
          <ReceivableReportCards
            v-else-if="!isChartsView && isCardsView"
            key="cardsView"
            :report="report"
          />
          <ReceivableReportChart v-else-if="isChartsView" key="chartsView" :report="report" />
        </FadeTransition>
      </div>
    </FadeTransition>

    <FloatToolbar>
      <template #fixed-buttons>
        <q-btn
          v-if="hasReport"
          key="refresh"
          :color="Dark.isActive ? 'grey-9' : 'grey-3'"
          icon="fal fa-arrows-rotate"
          round
          text-color="primary"
          @click="refresh"
        >
          <TopTooltip>Refresh</TopTooltip>
        </q-btn>

        <SwitchViewButton v-if="!!report && report.length > 0 && !isChartsView" key="switchView" />

        <ToggleChartsViewButton v-if="!!report && report.length > 0" key="toggleChartsView" />
      </template>
    </FloatToolbar>
  </QPagePadding>
</template>
