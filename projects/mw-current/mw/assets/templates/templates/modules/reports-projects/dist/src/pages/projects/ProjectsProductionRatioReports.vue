<script lang="ts">
import type { Ref } from 'vue';
import { computed, onUnmounted, ref, watch } from 'vue';

import { Dark } from 'quasar';

import { sumBy } from 'lodash-es';

import { oneThousandRound, pointTenRound } from 'utils/calculation.js';

import { useProjectsReportsStore } from 'stores/reports/ProjectsReports.js';

import useProjectCalculator from 'composables/reports/project/useProjectCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useNotifications from 'composables/useNotifications.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import FloatToolbar from 'components/shared/FloatToolbar.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';
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

  const store = useProjectsReportsStore();

  // Data

  const year = ref(new Date().getFullYear());
  const month = ref(new Date().getMonth() + 1);
  const report = ref(null) as Ref<ReturnType<(typeof store)['productionMonthlyReport']> | null>;

  // Computed

  const hasReports = computed(() => store.hasReports());

  // Methods

  function loadReport() {
    freezed.value = true;
    report.value = null;

    store
      .loadProductionMonthlyReport(year.value, month.value)
      .then(() => {
        report.value = store.productionMonthlyReport(year.value, month.value);
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
    store.releaseProjectsReports({ immediately: true });
    report.value = null;
  }

  // Lifecycle Hooks

  onUnmounted(() => {
    store.releaseProjectsReports({ immediately: false });
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

function useSummary(report: ReturnType<typeof usePageData>['report']) {
  // Private

  const projects = computed(() => report.value?.content || []);

  // Composables

  const mc = useProjectCalculator();

  // Computed

  const reportTitle = computed(() =>
    report.value
      ? `Projects Production Ratio Report ${report.value.year} - ${report.value.month}`
      : '',
  );

  const totalVatExcludedInvoice = computed(() =>
    sumBy(projects.value, (project) => mc.projectTotalVatExcludedInvoice(project)),
  );

  const totalExpense = computed(() =>
    sumBy(projects.value, (project) => mc.projectTotalExpense(project)),
  );

  const totalProductionSalary = computed(() =>
    sumBy(projects.value, (project) => mc.projectTotalProductionSalary(project)),
  );

  const productionRatio = computed(() =>
    totalProductionSalary.value === 0
      ? undefined
      : pointTenRound(
          (totalVatExcludedInvoice.value - totalExpense.value) / totalProductionSalary.value,
        ),
  );

  return {
    reportTitle,
    totalVatExcludedInvoice,
    totalExpense,
    totalProductionSalary,
    productionRatio,
  };
}

function useAdjustment(
  report: ReturnType<typeof usePageData>['report'],
  totalVatExcludedInvoice: ReturnType<typeof useSummary>['totalVatExcludedInvoice'],
  totalExpense: ReturnType<typeof useSummary>['totalExpense'],
  totalProductionSalary: ReturnType<typeof useSummary>['totalProductionSalary'],
  productionRatio: ReturnType<typeof useSummary>['productionRatio'],
) {
  // Composables

  const f = useFormats();

  // Data

  const adjustedProductionRatio = ref<number | undefined>(0);

  // Computed

  const adjustedTotalProductionSalary = computed(() => {
    if (f.isNumber(adjustedProductionRatio.value) && adjustedProductionRatio.value > 0) {
      return oneThousandRound(
        Math.round(
          (totalVatExcludedInvoice.value - totalExpense.value) / adjustedProductionRatio.value,
        ),
      );
    }

    return undefined;
  });

  const extraProductionSalary = computed(() => {
    if (adjustedTotalProductionSalary.value !== undefined) {
      return adjustedTotalProductionSalary.value - totalProductionSalary.value;
    }

    return undefined;
  });

  // Watch

  watch(report, () => {
    if (report.value === null) {
      adjustedProductionRatio.value = 0;
    } else {
      adjustedProductionRatio.value = productionRatio.value;
    }
  });

  return {
    adjustedProductionRatio,
    adjustedTotalProductionSalary,
    extraProductionSalary,
  };
}
</script>

<script setup lang="ts">
// Composables

const { cardWidth, listItemCardWidth, financeUrl } = requiredConfigEntries(
  'cardWidth',
  'listItemCardWidth',
  'financeUrl',
);

const f = useFormats();

const { isTableView, isCardsView } = useMultiViews();

const { yearOptions, monthOptions } = useSelectDateRange();

const mc = useProjectCalculator();

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

const {
  reportTitle,
  totalVatExcludedInvoice,
  totalExpense,
  totalProductionSalary,
  productionRatio,
} = useSummary(report);

const { adjustedProductionRatio, adjustedTotalProductionSalary, extraProductionSalary } =
  useAdjustment(
    report,
    totalVatExcludedInvoice,
    totalExpense,
    totalProductionSalary,
    productionRatio,
  );

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
            <div v-if="report.content.length === 0" key="empty" class="text-center">
              There is no data in the selected period of time.
            </div>

            <q-list v-else-if="isTableView" key="tableView" class="rounded-list">
              <q-expansion-item
                default-opened
                expand-icon-class="text-white"
                header-class="text-white text-h6 bg-accent"
                :label="reportTitle"
                popup
              >
                <q-card>
                  <q-card-section v-if="report.content.length === 0">
                    There is no project in the selected period of time.
                  </q-card-section>

                  <template v-else>
                    <StickyHeaders markup-table separated target="#mainTable" />

                    <q-markup-table id="mainTable" bordered separator="cell">
                      <thead>
                        <tr>
                          <th class="q-table--col-auto-width">#</th>
                          <th>Finish Date</th>
                          <th>Name</th>
                          <th>VAT Excluded Invoice</th>
                          <th>Expense</th>
                          <th>Production Salary</th>
                          <th>Production Ratio</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr v-for="(project, index) in report.content" :key="project.id">
                          <!-- Number -->
                          <td class="text-right">
                            {{ index + 1 }}
                          </td>

                          <!-- Finish Date -->
                          <td class="text-center">
                            {{ f.date(project.finishDate) }}
                          </td>

                          <!-- Name -->
                          <td class="text-wrap">
                            <ObjectLink
                              color="primary"
                              :href="`${financeUrl}/projects/${project.urlFriendlyName}`"
                              :label="project.name"
                              target="_blank"
                              wrap-label
                            >
                              <template #icon>
                                <StatusIcon
                                  class="q-mr-sm"
                                  icon="fal fa-briefcase"
                                  :status="project.statusHelper"
                                />
                              </template>
                            </ObjectLink>
                          </td>

                          <!-- VAT Excluded Invoice -->
                          <td class="text-right">
                            {{ f.currency(mc.projectTotalVatExcludedInvoice(project)) }}
                          </td>

                          <!-- Expense -->
                          <td class="text-right">
                            {{ f.currency(mc.projectTotalExpense(project)) }}
                          </td>

                          <!-- Production Salary -->
                          <td class="text-right">
                            {{ f.currency(mc.projectTotalProductionSalary(project)) }}
                          </td>

                          <!-- Production Ratio -->
                          <td class="text-center">
                            {{ mc.projectProductionRatio(project) === undefined ? '-' : 'x'
                            }}{{ mc.projectProductionRatio(project) }}
                          </td>
                        </tr>

                        <tr>
                          <!-- Number -->
                          <!-- Finish Date -->
                          <td class="text-right" colspan="2">
                            <strong>Total</strong>
                          </td>

                          <!-- Name -->
                          <td class="text-right" style="white-space: nowrap">
                            <span class="text-caption text-muted">Projects: </span>
                            <strong>{{ report.content.length }}</strong>
                          </td>

                          <!-- VAT Excluded Invoice -->
                          <td class="text-right">
                            <strong>{{ f.currency(totalVatExcludedInvoice) }}</strong>
                          </td>

                          <!-- Expense -->
                          <td class="text-right">
                            <strong>{{ f.currency(totalExpense) }}</strong>
                          </td>

                          <!-- Production Salary -->
                          <td class="text-right">
                            <strong>{{ f.currency(totalProductionSalary) }}</strong>
                          </td>

                          <!-- Production Ratio -->
                          <td class="text-center">
                            <strong>x{{ productionRatio }}</strong>
                          </td>
                        </tr>

                        <tr>
                          <td class="text-right" colspan="3">Adjustment</td>
                          <td class="text-right" colspan="2">
                            <span
                              v-if="extraProductionSalary !== undefined"
                              class="text-caption text-muted"
                            >
                              Extra Production Salary:
                            </span>
                            {{ f.currency(extraProductionSalary) }}
                          </td>
                          <td class="text-right">
                            {{ f.currency(adjustedTotalProductionSalary) }}
                          </td>
                          <td>
                            <q-input
                              v-model.number="adjustedProductionRatio"
                              dense
                              input-class="text-center"
                              prefix="x"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                  </template>
                </q-card>
              </q-expansion-item>
            </q-list>

            <div v-else-if="isCardsView" key="cardsView">
              <div class="row items-start justify-evenly q-gutter-md">
                <q-card style="width: 100%" :style="{ maxWidth: cardWidth + 'px' }">
                  <div class="bg-accent text-white">
                    <q-card-section class="q-pb-none">
                      <div class="text-h6 text-center">
                        {{ reportTitle }}
                      </div>
                    </q-card-section>

                    <q-card-section>
                      <div class="row justify-between">
                        <div>Projects</div>
                        <div class="text-warning">
                          <strong>
                            {{ report.content.length }}
                          </strong>
                        </div>
                      </div>
                    </q-card-section>

                    <q-separator dark inset />

                    <q-card-section>
                      <div class="row justify-between">
                        <div>Total VAT Excluded Invoice</div>
                        <div class="text-warning">
                          {{ f.currency(totalVatExcludedInvoice) }}
                        </div>
                      </div>

                      <div class="row justify-between">
                        <div>Total Expense</div>
                        <div class="text-warning">
                          {{ f.currency(totalExpense) }}
                        </div>
                      </div>

                      <div class="row justify-between">
                        <div>Total Production Salary</div>
                        <div class="text-warning">
                          {{ f.currency(totalProductionSalary) }}
                        </div>
                      </div>

                      <div class="row justify-between">
                        <div>
                          <strong>Production Ratio</strong>
                        </div>
                        <div class="text-warning">
                          <strong>x{{ f.currency(productionRatio) }}</strong>
                        </div>
                      </div>
                    </q-card-section>
                  </div>

                  <q-card-section class="q-col-gutter-md row">
                    <q-input
                      v-model.number="adjustedProductionRatio"
                      class="col-4 offset-8"
                      dense
                      hide-bottom-space
                      input-class="text-right"
                      label="Adjusted Production Ratio"
                      prefix="x"
                    />
                  </q-card-section>

                  <div class="bg-accent text-white">
                    <q-card-section>
                      <div class="row justify-between">
                        <div>Adjusted Total Production Salary</div>
                        <div class="text-warning">
                          {{ f.currency(adjustedTotalProductionSalary) }}
                        </div>
                      </div>

                      <div class="row justify-between">
                        <div>Extra Production Salary</div>
                        <div class="text-warning">
                          {{ f.currency(extraProductionSalary) }}
                        </div>
                      </div>
                    </q-card-section>
                  </div>
                </q-card>

                <div class="flex-break q-mt-none"></div>

                <ExpandableCard
                  v-for="project in report.content"
                  :key="project.id"
                  :external-link-url="`${financeUrl}/projects/${project.urlFriendlyName}`"
                  header-separator
                  :style="{ maxWidth: listItemCardWidth + 'px' }"
                  :subtitle="f.date(project.finishDate) || undefined"
                  subtitle-tooltip="Finish Date"
                  :title="project.name"
                  title-full-width
                >
                  <template #bezel-less>
                    <q-card-section class="text-caption">
                      <div class="row justify-between q-gutter-x-xs">
                        <div>VAT Excluded Invoice</div>
                        <div>
                          {{ f.currency(mc.projectTotalVatExcludedInvoice(project)) }}
                        </div>
                      </div>
                      <div class="row justify-between no-wrap q-gutter-x-sm">
                        <div>Expense</div>
                        <div>
                          {{ f.currency(mc.projectTotalExpense(project)) }}
                        </div>
                      </div>
                      <div class="row justify-between no-wrap q-gutter-x-sm">
                        <div>Production Salary</div>
                        <div>
                          {{ f.currency(mc.projectTotalProductionSalary(project)) }}
                        </div>
                      </div>
                      <div class="row justify-between no-wrap q-gutter-x-sm">
                        <div>
                          <strong>Production Ratio</strong>
                        </div>
                        <div>
                          <strong
                            >{{ mc.projectProductionRatio(project) === undefined ? '-' : 'x'
                            }}{{ mc.projectProductionRatio(project) }}</strong
                          >
                        </div>
                      </div>
                    </q-card-section>
                  </template>
                </ExpandableCard>
              </div>
            </div>
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

        <SwitchViewButton v-if="!!report && report.content.length > 0" key="switchView" />
      </template>
    </FloatToolbar>
  </QPagePadding>
</template>

<style scoped lang="scss">
thead th {
  white-space: normal;
}
</style>
