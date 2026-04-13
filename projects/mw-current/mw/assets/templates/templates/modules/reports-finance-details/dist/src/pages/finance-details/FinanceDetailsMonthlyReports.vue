<script lang="ts">
import type { Ref } from 'vue';
import { computed, onUnmounted, ref } from 'vue';

import { Dark } from 'quasar';

import { useFinanceDetailsReportsStore } from 'stores/reports/FinanceDetailsReports.js';

import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useNotifications from 'composables/useNotifications.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import FinanceDetailsReportCards from 'components/FinanceDetails/cards/FinanceDetailsReportCards.vue';
import FinanceDetailsReportTable from 'components/FinanceDetails/table/FinanceDetailsReportTable.vue';
import FloatToolbar from 'components/shared/FloatToolbar.vue';
import SwitchViewButton from 'components/shared/SwitchViewButton.vue';

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

  const store = useFinanceDetailsReportsStore();

  // Data

  const year = ref(new Date().getFullYear());
  const month = ref(new Date().getMonth() + 1);
  const report = ref(null) as Ref<ReturnType<(typeof store)['monthlyReport']> | null>;

  // Computed

  const hasReports = computed(() => store.hasReports());

  // Methods

  function loadReport() {
    freezed.value = true;
    report.value = null;

    store
      .loadMonthlyReport(year.value, month.value)
      .then(() => {
        report.value = store.monthlyReport(year.value, month.value);
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
    if (month.value === 1) {
      month.value = 12;
      year.value--;
    } else {
      month.value--;
    }

    loadReport();
  }

  function loadNextReport() {
    if (month.value === 12) {
      month.value = 1;
      year.value++;
    } else {
      month.value++;
    }

    loadReport();
  }

  function clearCache() {
    store.releaseFinanceDetailsReports({ immediately: true });
    report.value = null;
  }

  // Lifecycle Hooks

  onUnmounted(() => {
    store.releaseFinanceDetailsReports({ immediately: false });
  });

  return {
    year,
    month,
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

const f = useFormats();

const { isTableView, isCardsView } = useMultiViews();

const { yearOptions, monthOptions } = useSelectDateRange();

const { freezed } = usePageStatus();

const {
  year,
  month,
  report,
  hasReports,
  loadReport,
  loadPreviousReport,
  loadNextReport,
  clearCache,
} = usePageData(freezed);

// Computed

const reportTitle = computed(() =>
  report.value ? `Finance Details Monthly Report ${report.value.year} - ${report.value.month}` : '',
);
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
          <div class="q-col-gutter-md row">
            <q-select
              v-model="year"
              class="col-6"
              :disable="freezed"
              label="Year"
              :options="yearOptions"
            />

            <q-select
              v-model="month"
              class="col-6"
              :disable="freezed"
              label="Month"
              :options="monthOptions"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="around">
          <q-btn
            color="primary"
            :disable="freezed || (year === yearOptions[yearOptions.length - 1] && month === 1)"
            flat
            icon="fal fa-chevron-left"
            @click="loadPreviousReport"
          >
            <TopTooltip>Generate Previous Month Report</TopTooltip>
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
            :disable="freezed || (year === yearOptions[0] && month === 12)"
            flat
            icon="fal fa-chevron-right"
            @click="loadNextReport"
          >
            <TopTooltip>Generate Next Month Report</TopTooltip>
          </q-btn>
        </q-card-actions>

        <q-linear-progress v-if="freezed" color="warning" indeterminate />
      </q-card>

      <FadeTransition>
        <template v-if="!!report">
          <FadeTransition>
            <div v-if="report.content.details.length === 0" key="empty" class="q-gutter-y-md">
              <q-card
                class="bg-accent q-mx-auto"
                dark
                style="width: 100%"
                :style="{ maxWidth: cardWidth + 'px' }"
              >
                <q-card-section class="q-pb-none">
                  <div class="text-h6 text-center">
                    {{ reportTitle }}
                  </div>
                </q-card-section>

                <q-card-section>
                  <div class="row justify-between">
                    <div>Ending Receivable</div>
                    <div class="text-warning">
                      {{ f.currency(report.content.endingReceivable) }}
                    </div>
                  </div>

                  <div class="row justify-between">
                    <div>Ending Payable</div>
                    <div class="text-warning">
                      {{ f.currency(report.content.endingPayable) }}
                    </div>
                  </div>

                  <div class="row justify-between">
                    <div>Ending Available Cash</div>
                    <div class="text-warning">
                      {{ f.currency(report.content.endingAvailableCash) }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <div class="text-center">There is no data in the selected period of time.</div>
            </div>

            <FinanceDetailsReportTable
              v-else-if="isTableView"
              key="tableView"
              :content="report.content"
              :report-title="reportTitle"
            />

            <FinanceDetailsReportCards
              v-else-if="isCardsView"
              key="cardsView"
              :content="report.content"
              :report-title="reportTitle"
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

        <SwitchViewButton v-if="!!report && report.content.details.length > 0" key="switchView" />
      </template>
    </FloatToolbar>
  </QPagePadding>
</template>
