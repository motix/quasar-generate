<script lang="ts">
import type { Ref } from 'vue';
import { computed, markRaw, onUnmounted, ref } from 'vue';

import { Dark, date } from 'quasar';

import { useForm } from 'vee-validate';
import { object } from 'yup';

import { asIsRequired, dateRequired } from 'utils/validation.js';

import type { FinanceAccountLite } from 'models/finance/index.js';

import { useFinanceAccountsReportsStore } from 'stores/reports/FinanceAccountsReports.js';

import useFinanceAccountOptions from 'composables/finance/shared/useFinanceAccountOptions.js';
import useYearOptions from 'composables/reports/shared/useYearOptions.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useNotifications from 'composables/useNotifications.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import FinanceAccountReportCards from 'components/FinanceAccount/cards/FinanceAccountReportCards.vue';
import FinanceAccountReportTable from 'components/FinanceAccount/table/FinanceAccountReportTable.vue';
import FloatToolbar from 'components/shared/FloatToolbar.vue';
import SwitchViewButton from 'components/shared/SwitchViewButton.vue';

function usePageStatus() {
  // Data

  const ready = ref(false);
  const freezed = ref(false);

  return {
    ready,
    freezed,
  };
}

function useValidation(initialValues: {
  financeAccount: FinanceAccountLite | null;
  startDate: string;
  endDate: string;
}) {
  // Private

  const { editDateFormat } = requiredConfigEntries('editDateFormat');
  const years = useSelectDateRange().yearOptions.value;

  const validationSchema = markRaw(
    object({
      financeAccount: asIsRequired<FinanceAccountLite>('Finance Account'),
      startDate: dateRequired('Start Date').test({
        message: `Start Date must be from ${years[years.length - 1]}`,
        test: (value) =>
          !value ||
          date.extractDate(value, editDateFormat).getFullYear() >= years[years.length - 1]!,
      }),
      endDate: dateRequired('End Date').test({
        message: 'End Date must be greater than or equal to Start Date',
        test: (value, context) =>
          !value ||
          !context.parent.startDate ||
          date.extractDate(value, editDateFormat) >=
            date.extractDate(context.parent.startDate, editDateFormat),
      }),
    }),
  );

  // Private Executions

  const { validate } = useForm({
    validationSchema,
    initialValues,
  });

  return {
    validate,
  };
}

function usePageData(freezed: ReturnType<typeof usePageStatus>['freezed']) {
  // Private

  const { editDateFormat } = requiredConfigEntries('editDateFormat');
  const years = useSelectDateRange().yearOptions.value;

  const initialValues = {
    financeAccount: null,
    startDate: date.formatDate(new Date(years[years.length - 1]!, 0, 1), editDateFormat),
    endDate: date.formatDate(
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
      editDateFormat,
    ),
  };

  // Composables

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  const store = useFinanceAccountsReportsStore();

  const { validate } = useValidation(initialValues);

  // Data

  const financeAccount: Ref<FinanceAccountLite | null> = ref(initialValues.financeAccount);
  const startDate = ref(initialValues.startDate);
  const endDate = ref(initialValues.endDate);
  const report = ref(null) as Ref<Awaited<ReturnType<(typeof store)['rangeReport']>> | null>;
  const balanceRecords = ref(true);
  const projectInvoiceTransactions = ref(true);
  const projectExpenseTransactions = ref(true);
  const generalInvoiceTransactions = ref(true);
  const generalExpenseTransactions = ref(true);
  const generalTransactions = ref(true);

  // Computed

  const hasReports = computed(() => store.hasReports());

  // Methods

  function dateOptionsFn(date: string) {
    return date >= `${years[years.length - 1]}/01/01`;
  }

  async function loadReport() {
    if (!(await validate()).valid) {
      return;
    }

    if (!financeAccount.value) {
      return;
    }

    freezed.value = true;
    report.value = null;
    balanceRecords.value = true;
    projectInvoiceTransactions.value = true;
    projectExpenseTransactions.value = true;
    generalInvoiceTransactions.value = true;
    generalExpenseTransactions.value = true;
    generalTransactions.value = true;

    try {
      report.value = await store.rangeReport(
        financeAccount.value.id,
        date.extractDate(startDate.value, editDateFormat),
        date.extractDate(endDate.value, editDateFormat),
      );
      freezed.value = false;
    } catch (error) {
      console.error(error);
      notifyLoadDataError();
      notifyErrorDebug(error);
      freezed.value = false;
    }
  }

  function clearCache() {
    store.releaseFinanceAccountsReports({ immediately: true });
    report.value = null;
  }

  // Lifecycle Hooks

  onUnmounted(() => {
    store.releaseFinanceAccountsReports({ immediately: false });
  });

  return {
    financeAccount,
    startDate,
    endDate,
    report,
    balanceRecords,
    projectInvoiceTransactions,
    projectExpenseTransactions,
    generalInvoiceTransactions,
    generalExpenseTransactions,
    generalTransactions,
    hasReports,
    dateOptionsFn,
    loadReport,
    clearCache,
  };
}
</script>

<script setup lang="ts">
// Composables

const { cardWidth } = requiredConfigEntries('cardWidth');

const f = useFormats();

const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

const { isTableView, isCardsView } = useMultiViews();

const {
  financeAccountOptions,
  financeAccountsEditorDependenciesStore,
  filterFinanceAccountOptions,
} = useFinanceAccountOptions();

const { ready, freezed } = usePageStatus();

const {
  financeAccount,
  startDate,
  endDate,
  report,
  balanceRecords,
  projectInvoiceTransactions,
  projectExpenseTransactions,
  generalInvoiceTransactions,
  generalExpenseTransactions,
  generalTransactions,
  hasReports,
  dateOptionsFn,
  loadReport,
  clearCache,
} = usePageData(freezed);

const { year, yearOptions } = useYearOptions(startDate, endDate, loadReport, 0);

// Computed

const reportTitle = computed(() =>
  report.value
    ? `Finance Account Report ${
        financeAccountOptions.value.find((value) => value.id === report.value?.financeAccountId)
          ?.name
      } ${f.date(report.value.startDate)} - ${f.date(report.value.endDate)}`
    : '',
);

// Private Executions

financeAccountsEditorDependenciesStore.store
  .loadAllDocs(financeAccountsEditorDependenciesStore.payload)
  .then(() => (ready.value = true))
  .catch((error) => {
    console.error(error);
    notifyLoadDataError();
    notifyErrorDebug(error);
    ready.value = true;
  });
</script>

<template>
  <QPagePadding padding>
    <!-- Loading -->
    <FadeTransition>
      <div v-if="!ready" class="absolute-center">
        <q-spinner-pie color="primary" size="6em" />
      </div>
    </FadeTransition>

    <!-- Ready -->
    <FadeTransition>
      <div v-show="ready" class="q-gutter-y-lg">
        <div class="text-center">
          <q-btn-toggle
            v-model="year"
            class="justify-center"
            :options="yearOptions"
            style="flex-wrap: wrap"
            toggle-color="primary"
          />
        </div>

        <q-card
          class="q-mx-auto"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          style="width: 100%"
          :style="{ maxWidth: cardWidth + 'px' }"
        >
          <q-card-section>
            <div class="q-col-gutter-md row">
              <QSelectVal
                v-model="financeAccount"
                class="col-12"
                :disable="freezed"
                fill-input
                hide-selected
                label="Finance Account"
                name="financeAccount"
                option-label="name"
                option-value="id"
                :options="financeAccountOptions"
                use-input
                @filter="filterFinanceAccountOptions"
              />

              <QDateInputVal
                v-model="startDate"
                class="col-6"
                :date-options="dateOptionsFn"
                :disable="freezed"
                label="Start Date"
                name="startDate"
              />

              <QDateInputVal
                v-model="endDate"
                class="col-6"
                :date-options="dateOptionsFn"
                :disable="freezed"
                label="End Date"
                name="endDate"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="around">
            <q-btn
              color="primary"
              :disable="freezed"
              flat
              label="Generate Report"
              @click="loadReport"
            />
          </q-card-actions>

          <q-linear-progress v-if="freezed" color="warning" indeterminate />

          <q-slide-transition>
            <div v-if="(report?.content.detailsWithBalanceRecords.length || 0) > 0">
              <q-separator />

              <q-card-section>
                <div class="q-col-gutter-md row">
                  <q-toggle
                    v-model="projectInvoiceTransactions"
                    checked-icon="fal fa-check"
                    class="col-6"
                    label="Project Invoice Transactions"
                    unchecked-icon="clear"
                  />
                  <q-toggle
                    v-model="projectExpenseTransactions"
                    checked-icon="fal fa-check"
                    class="col-6"
                    label="Project Expense Transactions"
                    unchecked-icon="clear"
                  />
                  <q-toggle
                    v-model="generalInvoiceTransactions"
                    checked-icon="fal fa-check"
                    class="col-6"
                    label="General Invoice Transactions"
                    unchecked-icon="clear"
                  />
                  <q-toggle
                    v-model="generalExpenseTransactions"
                    checked-icon="fal fa-check"
                    class="col-6"
                    label="General Expense Transactions"
                    unchecked-icon="clear"
                  />
                  <q-toggle
                    v-model="generalTransactions"
                    checked-icon="fal fa-check"
                    class="col-6"
                    label="General Transactions"
                    unchecked-icon="clear"
                  />
                  <q-toggle
                    v-model="balanceRecords"
                    checked-icon="fal fa-check"
                    class="col-6"
                    label="Balance Records"
                    unchecked-icon="clear"
                  />
                </div>
              </q-card-section>
            </div>
          </q-slide-transition>
        </q-card>

        <FadeTransition>
          <template v-if="!!report">
            <FadeTransition>
              <div
                v-if="report.content.detailsWithBalanceRecords.length === 0"
                key="empty"
                class="q-gutter-y-md"
              >
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
                      <div>Ending Balance</div>
                      <div class="text-warning">
                        {{ f.currency(report.content.endingBalance) }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <div class="text-center">There is no data in the selected period of time.</div>
              </div>

              <FinanceAccountReportTable
                v-else-if="isTableView"
                key="tableView"
                :balance-records="balanceRecords"
                :content="report.content"
                :general-expense-transactions="generalExpenseTransactions"
                :general-invoice-transactions="generalInvoiceTransactions"
                :general-transactions="generalTransactions"
                :project-expense-transactions="projectExpenseTransactions"
                :project-invoice-transactions="projectInvoiceTransactions"
                :report-title="reportTitle"
              />

              <FinanceAccountReportCards
                v-else-if="isCardsView"
                key="cardsView"
                :balance-records="balanceRecords"
                :content="report.content"
                :general-expense-transactions="generalExpenseTransactions"
                :general-invoice-transactions="generalInvoiceTransactions"
                :general-transactions="generalTransactions"
                :project-expense-transactions="projectExpenseTransactions"
                :project-invoice-transactions="projectInvoiceTransactions"
                :report-title="reportTitle"
              />
            </FadeTransition>
          </template>
        </FadeTransition>
      </div>
    </FadeTransition>

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
          v-if="!!report && report.content.detailsWithBalanceRecords.length > 0"
          key="switchView"
        />
      </template>
    </FloatToolbar>
  </QPagePadding>
</template>
