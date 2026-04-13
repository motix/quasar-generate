<script lang="ts">
import type { Ref } from 'vue';
import { computed, markRaw, onUnmounted, ref, watch, watchEffect } from 'vue';

import { Dark, date } from 'quasar';

import { useForm } from 'vee-validate';
import { object } from 'yup';

import { dateRequired } from 'utils/validation.js';

import type { ExpenseGroupLite, FinanceAccountLite } from 'models/finance';

import { useExpensesReportsStore } from 'stores/reports/ExpensesReports.js';

import useExportExpensesRangeReportToExcel from 'composables/reports/expense/useExportExpensesRangeReportToExcel.js';
import useYearOptions from 'composables/reports/shared/useYearOptions.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useNotifications from 'composables/useNotifications.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import ExpensesReportCards from 'components/Expense/cards/ExpensesReportCards.vue';
import ExpensesReportTable from 'components/Expense/table/ExpensesReportTable.vue';
import FloatToolbar from 'components/shared/FloatToolbar.vue';
import SwitchViewButton from 'components/shared/SwitchViewButton.vue';

function usePageStatus() {
  // Data

  const freezed = ref(false);

  return {
    freezed,
  };
}

function useValidation(initialValues: { startDate: string; endDate: string }) {
  // Private

  const { editDateFormat } = requiredConfigEntries('editDateFormat');
  const years = useSelectDateRange().yearOptions.value;

  const validationSchema = markRaw(
    object({
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

function useFilters() {
  // Data

  const showProjectExpenses = ref(true);
  const showGeneralExpenses = ref(true);
  const showAllFinanceAccounts = ref(false);
  const selectedFinanceAccounts = ref<{ [index: string]: boolean }>({});
  const showAllExpenseGroups = ref(false);
  const selectedExpenseGroups = ref<{ [index: string]: boolean }>({});

  // Methods

  function resetFilters() {
    showProjectExpenses.value = true;
    showGeneralExpenses.value = true;
    selectedFinanceAccounts.value = {};
    selectedExpenseGroups.value = {};
  }

  function reloadFilters(financeAccounts: FinanceAccountLite[], expenseGroups: ExpenseGroupLite[]) {
    selectedFinanceAccounts.value = financeAccounts
      .map((value) => value.id)
      .reduce(
        (previousValue, currentValue) => ({
          ...previousValue,
          [currentValue]: false,
        }),
        {},
      );

    selectedExpenseGroups.value = expenseGroups
      .map((value) => value.id)
      .reduce(
        (previousValue, currentValue) => ({
          ...previousValue,
          [currentValue]: true,
        }),
        { '': true },
      );
  }

  // Watch

  watch(showAllFinanceAccounts, (value) => {
    selectedFinanceAccounts.value = Object.keys(selectedFinanceAccounts.value).reduce(
      (previousValue, currentValue) => ({
        ...previousValue,
        [currentValue]: value,
      }),
      {},
    );
  });

  watchEffect(() => {
    if (
      Object.keys(selectedFinanceAccounts.value).length > 0 &&
      !Object.keys(selectedFinanceAccounts.value).some(
        (key) => selectedFinanceAccounts.value[key] === false,
      )
    ) {
      showAllFinanceAccounts.value = true;
    }

    if (
      Object.keys(selectedFinanceAccounts.value).length > 0 &&
      !Object.keys(selectedFinanceAccounts.value).some(
        (key) => selectedFinanceAccounts.value[key] === true,
      )
    ) {
      showAllFinanceAccounts.value = false;
    }
  });

  watch(showAllExpenseGroups, (value) => {
    selectedExpenseGroups.value = Object.keys(selectedExpenseGroups.value).reduce(
      (previousValue, currentValue) => ({
        ...previousValue,
        [currentValue]: value,
      }),
      {},
    );
  });

  watchEffect(() => {
    if (
      Object.keys(selectedExpenseGroups.value).length > 0 &&
      !Object.keys(selectedExpenseGroups.value).some(
        (key) => selectedExpenseGroups.value[key] === false,
      )
    ) {
      showAllExpenseGroups.value = true;
    }

    if (
      Object.keys(selectedExpenseGroups.value).length > 0 &&
      !Object.keys(selectedExpenseGroups.value).some(
        (key) => selectedExpenseGroups.value[key] === true,
      )
    ) {
      showAllExpenseGroups.value = false;
    }
  });

  return {
    showProjectExpenses,
    showGeneralExpenses,
    showAllFinanceAccounts,
    selectedFinanceAccounts,
    showAllExpenseGroups,
    selectedExpenseGroups,
    resetFilters,
    reloadFilters,
  };
}

function usePageData(
  freezed: ReturnType<typeof usePageStatus>['freezed'],
  resetFilters: ReturnType<typeof useFilters>['resetFilters'],
  reloadFilters: ReturnType<typeof useFilters>['reloadFilters'],
) {
  // Private

  const { editDateFormat } = requiredConfigEntries('editDateFormat');
  const years = useSelectDateRange().yearOptions.value;

  const initialValues = {
    startDate: date.formatDate(new Date(years[years.length - 1]!, 0, 1), editDateFormat),
    endDate: date.formatDate(
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
      editDateFormat,
    ),
  };

  // Composables

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  const store = useExpensesReportsStore();

  const { validate } = useValidation(initialValues);

  // Data

  const startDate = ref(initialValues.startDate);
  const endDate = ref(initialValues.endDate);
  const report = ref(null) as Ref<Awaited<ReturnType<(typeof store)['rangeReport']>> | null>;

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

    freezed.value = true;
    report.value = null;
    resetFilters();

    try {
      report.value = await store.rangeReport(
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

    reloadFilters(
      report.value?.content.financeAccounts || [],
      report.value?.content.expenseGroups || [],
    );
  }

  function clearCache() {
    store.releaseExpensesReports({ immediately: true });
    report.value = null;
  }

  // Lifecycle Hooks

  onUnmounted(() => {
    store.releaseExpensesReports({ immediately: false });
  });

  return {
    startDate,
    endDate,
    report,
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

const { isTableView, isCardsView } = useMultiViews();

const { freezed } = usePageStatus();

const {
  showProjectExpenses,
  showGeneralExpenses,
  showAllFinanceAccounts,
  selectedFinanceAccounts,
  showAllExpenseGroups,
  selectedExpenseGroups,
  resetFilters,
  reloadFilters,
} = useFilters();

const { startDate, endDate, report, hasReports, dateOptionsFn, loadReport, clearCache } =
  usePageData(freezed, resetFilters, reloadFilters);

const { year, yearOptions } = useYearOptions(startDate, endDate, loadReport, 0);

const { exportExpensesRangeReportToExcel } = useExportExpensesRangeReportToExcel();

// Computed

const reportTitle = computed(() =>
  report.value
    ? `Expenses Report ${f.date(report.value.startDate)} - ${f.date(report.value.endDate)}`
    : '',
);

const showExportToExcelButton = computed(
  () => !!report.value && report.value.content.details.length > 0,
);
</script>

<template>
  <QPagePadding padding>
    <div class="q-gutter-y-lg">
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
          <div v-if="(report?.content.details.length || 0) > 0">
            <q-separator />

            <q-card-section>
              <div class="q-col-gutter-md row">
                <q-toggle
                  v-model="showProjectExpenses"
                  checked-icon="fal fa-check"
                  class="col-6"
                  label="Project Expense"
                  unchecked-icon="clear"
                />
                <q-toggle
                  v-model="showGeneralExpenses"
                  checked-icon="fal fa-check"
                  class="col-6"
                  label="General Expense"
                  unchecked-icon="clear"
                />
              </div>
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>

      <q-slide-transition>
        <q-card
          v-if="report?.content.financeAccounts.length || 0 > 0"
          class="q-mx-auto"
          style="width: 100%"
          :style="{ maxWidth: cardWidth * 2 + 'px' }"
        >
          <q-card-section>
            <div class="text-overline text-weight-regular text-uppercase text-muted">
              Finance Accounts
            </div>

            <div class="q-col-gutter-md row justify-left">
              <q-toggle
                v-model="showAllFinanceAccounts"
                checked-icon="fal fa-check"
                class="col-6 col-sm-4 col-md-3"
                label="All"
                unchecked-icon="clear"
              />
              <q-toggle
                v-for="financeAccount in report!.content.financeAccounts"
                :key="financeAccount.id"
                v-model="selectedFinanceAccounts[financeAccount.id]"
                checked-icon="fal fa-check"
                class="col-6 col-sm-4 col-md-3"
                :label="financeAccount.name"
                unchecked-icon="clear"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-slide-transition>

      <q-slide-transition>
        <q-card
          v-if="report?.content.expenseGroups.length || 0 > 0"
          class="q-mx-auto"
          style="width: 100%"
          :style="{ maxWidth: cardWidth * 2 + 'px' }"
        >
          <q-card-section>
            <div class="text-overline text-weight-regular text-uppercase text-muted">Groups</div>

            <div class="q-col-gutter-md row justify-left">
              <q-toggle
                v-model="showAllExpenseGroups"
                checked-icon="fal fa-check"
                class="col-6 col-sm-4 col-md-3"
                label="All"
                unchecked-icon="clear"
              />
              <q-toggle
                v-model="selectedExpenseGroups['']"
                checked-icon="fal fa-check"
                class="col-6 col-sm-4 col-md-3"
                label="Not in any group"
                unchecked-icon="clear"
              />
              <q-toggle
                v-for="group in report!.content.expenseGroups"
                :key="group.id"
                v-model="selectedExpenseGroups[group.id]"
                checked-icon="fal fa-check"
                class="col-6 col-sm-4 col-md-3"
                :label="group.name"
                unchecked-icon="clear"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-slide-transition>

      <FadeTransition>
        <template v-if="!!report">
          <FadeTransition>
            <div v-if="report.content.details.length === 0" key="empty" class="q-gutter-y-md">
              <div class="text-center">There is no data in the selected period of time.</div>
            </div>

            <ExpensesReportTable
              v-else-if="isTableView"
              key="tableView"
              :content="report.content"
              :report-title="reportTitle"
              :selected-expense-groups="selectedExpenseGroups"
              :selected-finance-accounts="selectedFinanceAccounts"
              :show-general-expenses="showGeneralExpenses"
              :show-project-expenses="showProjectExpenses"
            />

            <ExpensesReportCards
              v-else-if="isCardsView"
              key="cardsView"
              :content="report.content"
              :report-title="reportTitle"
              :selected-expense-groups="selectedExpenseGroups"
              :selected-finance-accounts="selectedFinanceAccounts"
              :show-general-expenses="showGeneralExpenses"
              :show-project-expenses="showProjectExpenses"
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

        <q-btn
          v-show="showExportToExcelButton"
          key="exportToExcel"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          icon="fal fa-file-excel"
          outline
          padding="sm"
          text-color="primary"
          @click="() => void exportExpensesRangeReportToExcel(report!)"
        >
          <TopTooltip>Export to Excel</TopTooltip>
        </q-btn>
      </template>
    </FloatToolbar>
  </QPagePadding>
</template>
