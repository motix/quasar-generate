<script lang="ts">
import type { Ref } from 'vue';
import { computed, onUnmounted, ref } from 'vue';

import { Dark } from 'quasar';

import type { ProjectsAllYearsReport } from 'models/reports/index.js';

import { useProjectsReportsStore } from 'stores/reports/ProjectsReports.js';

import useNotifications from 'composables/useNotifications.js';

import ProjectsAllYearsReportCharts from 'components/Project/charts/ProjectsAllYearsReportCharts.vue';
import FloatToolbar from 'components/shared/FloatToolbar.vue';

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

  const store = useProjectsReportsStore();

  // Data

  const report = ref(null) as Ref<ProjectsAllYearsReport | null>;

  // Computed

  const hasReport = computed(() => store.hasReports());

  // Methods

  function loadReport() {
    ready.value = false;
    report.value = null;

    store
      .loadAllYearsReport()
      .then(() => {
        // Casting is requried as DocumentStatus contains private fields
        // See https://github.com/vuejs/core/issues/2981
        report.value = store.allYearsReport as ProjectsAllYearsReport;
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
    store.releaseProjectsReports({ immediately: true });
    loadReport();
  }

  // Lifecycle Hooks

  onUnmounted(() => {
    store.releaseProjectsReports({ immediately: false });
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

const { ready } = usePageStatus();

const { report, hasReport, loadReport, refresh } = usePageData(ready);

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
        <ProjectsAllYearsReportCharts :years="report.years" />
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
      </template>
    </FloatToolbar>
  </QPagePadding>
</template>
