<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useMeta } from 'quasar';

import { sumBy } from 'lodash-es';

import type { Project } from 'models/production/index.js';

import { useTimesheetsStore } from 'stores/production/Timesheets.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useProjectCalculator from 'composables/production/project/useProjectCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import TimesheetViewerInnerTable from 'components/Timesheet/table/TimesheetViewerInnerTable.vue';

// Constants

const SCOPE_NAME = 'timesheets-view-page';

// Composables

const route = useRoute();
const store = useTimesheetsStore();

const { appName, cardWidth } = requiredConfigEntries('appName', 'cardWidth');

const f = useFormats();

const mc = useProjectCalculator<Project>();

const $p = useViewPage<ReturnType<(typeof store)['timesheet']>, never>(SCOPE_NAME, true);
const {
  // Auto sort
  model,
  ready,
} = $p;

// Data

const year = ref(Number(route.params.year as string));
const month = ref(Number(route.params.month as string));

// Computed

const totalProductionSalary = computed(() =>
  sumBy(model.value?.projects || [], (project) => mc.projectTotalProductionSalary(project)),
);

// Private Executions

useMeta(() => ({
  title: `Print Timesheet - ${appName}`,
}));

// usePageFeatures
$p.hasEditor.value = false;

// usePageData
$p.modelGetter.value = () => store.timesheet(year.value, month.value, true);

// usePageData - loadModel
void $p
  .loadModel((payload) => {
    store
      .loadTimesheet(year.value, month.value, true)
      .then(() => {
        payload.done();
      })
      .catch((error) => {
        payload.error && payload.error(error);
      });

    return {
      docKey: '',
      release: () => store.releaseTimesheets({ immediately: true }),
    };
  })
  .then(() => {
    $p.ready.value = true;

    setTimeout(() => {
      if (model.value) {
        window.print();
      }
    }, 500);
  });

// Lifecycle Hooks

onUnmounted(() => {
  $p.releaseModel.value && $p.releaseModel.value();
});
</script>

<template>
  <div>
    <FadeTransition>
      <div v-if="!ready" key="loading" class="absolute-center">
        <q-spinner-pie color="primary" size="6em" />
      </div>

      <div v-else-if="!model" key="empty" class="absolute-center">
        Timesheet is not available. Please contact support.
      </div>

      <div v-else key="ready" class="q-gutter-y-lg">
        <!-- Title -->
        <div class="text-right q-pt-xl">
          <div class="text-h5 text-weight-light">
            {{ f.yearMonth(model.year, model.month) }}
          </div>
          <div class="text-caption text-weight-light">Printed on: {{ f.date(new Date()) }}</div>
        </div>

        <!-- Summary -->
        <q-list bordered class="q-mx-auto" separator :style="{ maxWidth: cardWidth + 'px' }">
          <q-item>
            <q-item-section>Projects</q-item-section>
            <q-item-section class="text-right">
              {{ model.projects.length }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Total Salary</q-item-section>
            <q-item-section class="text-right">
              {{ f.currency(totalProductionSalary) }}
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Main -->
        <TimesheetViewerInnerTable
          :filtered-projects="model.projects"
          printer-friendly
          :single-member="false"
          :timesheet="model"
          :total-production-salary="totalProductionSalary"
        />
      </div>
    </FadeTransition>
  </div>
</template>
