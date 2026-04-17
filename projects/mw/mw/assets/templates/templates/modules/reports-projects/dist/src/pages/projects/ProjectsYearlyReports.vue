<script lang="ts">
import type { Ref } from 'vue';
import { computed, onUnmounted, ref } from 'vue';

import { Dark } from 'quasar';

import { useProjectsReportsStore } from 'stores/reports/ProjectsReports.js';

import useExportProjectsYearlyReportToExcel from 'composables/reports/project/useExportProjectsYearlyReportToExcel.js';
import useCharts from 'composables/useCharts.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useMultiViews from 'composables/useMultiViews.js';
import useNotifications from 'composables/useNotifications.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import ProjectsReportCards from 'components/Project/cards/ProjectsReportCards.vue';
import ProjectsYearlyReportCharts from 'components/Project/charts/ProjectsYearlyReportCharts.vue';
import ProjectsReportTable from 'components/Project/table/ProjectsReportTable.vue';
import FloatToolbar from 'components/shared/FloatToolbar.vue';
import SwitchViewButton from 'components/shared/SwitchViewButton.vue';
import ToggleChartsViewButton from 'components/shared/ToggleChartsViewButton.vue';

function usePageStatus() {
  // Data

  const freezed = ref(false);

  return {
    freezed,
  };
}

function usePageData(freezed: ReturnType<typeof usePageStatus>['freezed']) {
  // Composables

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  const store = useProjectsReportsStore();

  // Data

  const year = ref(new Date().getFullYear());
  const report = ref(null) as Ref<ReturnType<(typeof store)['yearlyReport']> | null>;

  // Computed

  const hasReports = computed(() => store.hasReports());

  // Methods

  function loadReport() {
    freezed.value = true;
    report.value = null;

    store
      .loadYearlyReport(year.value)
      .then(() => {
        report.value = store.yearlyReport(year.value);
        freezed.value = false;
      })
      .catch((error) => {
        console.error(error);
        notifyLoadDataError();
        notifyErrorDebug(error);
        freezed.value = false;
      });
  }

  function loadPreviousReport() {
    year.value--;

    loadReport();
  }

  function loadNextReport() {
    year.value++;

    loadReport();
  }

  function clearCache() {
    store.releaseProjectsReports({ immediately: true });
    report.value = null;
  }

  // Lifecycle Hooks

  onUnmounted(() => {
    store.releaseProjectsReports({ immediately: false });
  });

  return {
    year,
    report,
    hasReports,
    loadReport,
    loadPreviousReport,
    loadNextReport,
    clearCache,
  };
}
</script>

<script setup lang="ts">
// Composables

const { cardWidth } = requiredConfigEntries('cardWidth');

const { isTableView, isCardsView } = useMultiViews();

const { yearOptions } = useSelectDateRange();

const { freezed } = usePageStatus();

const { year, report, hasReports, loadReport, loadPreviousReport, loadNextReport, clearCache } =
  usePageData(freezed);

const { isChartsView } = useCharts();

const { exportProjectsYearlyReportToExcel } = useExportProjectsYearlyReportToExcel();

// Computed

const reportTitle = computed(() =>
  report.value ? `Projects Yearly Report ${report.value.year}` : '',
);

const showExportToExcelButton = computed(() => !!report.value && report.value.content.length > 0);

//  Private Executions

setTimeout(() => {
  loadReport();
}, 500);
</script>

<template>
  <QPagePadding padding>
    <div class="q-gutter-y-lg">
      <q-card
        class="q-mx-auto"
        :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
        style="width: 100%"
        :style="{ maxWidth: cardWidth + 'px' }"
      >
        <q-card-section>
          <q-select
            v-model="year"
            class="col-6"
            :disable="freezed"
            label="Year"
            :options="yearOptions"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="around">
          <q-btn
            color="primary"
            :disable="freezed || year === yearOptions[yearOptions.length - 1]"
            flat
            icon="fal fa-chevron-left"
            @click="loadPreviousReport"
          >
            <TopTooltip>Generate Previous Year Report</TopTooltip>
          </q-btn>
          <q-btn
            color="primary"
            :disable="freezed"
            flat
            label="Generate Report"
            @click="loadReport"
          />
          <q-btn
            color="primary"
            :disable="freezed || year === yearOptions[0]"
            flat
            icon="fal fa-chevron-right"
            @click="loadNextReport"
          >
            <TopTooltip>Generate Next Year Report</TopTooltip>
          </q-btn>
        </q-card-actions>

        <q-linear-progress v-if="freezed" color="warning" indeterminate />
      </q-card>

      <FadeTransition>
        <template v-if="!!report">
          <FadeTransition>
            <div v-if="report.content.length === 0" key="empty" class="text-center">
              There is no data in the selected period of time.
            </div>

            <ProjectsReportTable
              v-else-if="!isChartsView && isTableView"
              key="tableView"
              :projects="report.content"
              :report-title="reportTitle"
            />

            <ProjectsReportCards
              v-else-if="!isChartsView && isCardsView"
              key="cardsView"
              :projects="report.content"
              :report-title="reportTitle"
            />

            <ProjectsYearlyReportCharts
              v-else-if="isChartsView"
              key="chartsView"
              :projects="report.content"
            />
          </FadeTransition>
        </template>
      </FadeTransition>
    </div>

    <FloatToolbar>
      <template #fixed-buttons>
        <q-btn
          v-if="hasReports"
          key="clearCache"
          :color="Dark.isActive ? 'grey-9' : 'grey-3'"
          icon="fal fa-broom-wide"
          round
          text-color="primary"
          @click="clearCache"
        >
          <TopTooltip>Clear Cache</TopTooltip>
        </q-btn>

        <SwitchViewButton
          v-if="!!report && report.content.length > 0 && !isChartsView"
          key="switchView"
        />

        <ToggleChartsViewButton
          v-if="!!report && report.content.length > 0"
          key="toggleChartsView"
        />

        <q-btn
          v-show="showExportToExcelButton"
          key="exportToExcel"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          icon="fal fa-file-excel"
          outline
          padding="sm"
          text-color="primary"
          @click="() => void exportProjectsYearlyReportToExcel(report!)"
        >
          <TopTooltip>Export to Excel</TopTooltip>
        </q-btn>
      </template>
    </FloatToolbar>
  </QPagePadding>
</template>
