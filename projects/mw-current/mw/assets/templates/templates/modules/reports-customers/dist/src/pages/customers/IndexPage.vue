<script lang="ts">
import type { Ref } from 'vue';
import { computed, markRaw, onUnmounted, ref } from 'vue';

import { Dark, date } from 'quasar';

import { useForm } from 'vee-validate';
import { object } from 'yup';

import { asIsRequired, dateRequired } from 'utils/validation.js';

import type { CustomerLite } from 'models/finance/index.js';

import { useCustomersReportsStore } from 'stores/reports/CustomersReports.js';

import useCustomerOptions from 'composables/finance/shared/useCustomerOptions.js';
import useYearOptions from 'composables/reports/shared/useYearOptions.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useNotifications from 'composables/useNotifications.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import CustomerReportCards from 'components/Customer/cards/CustomerReportCards.vue';
import CustomerReportTable from 'components/Customer/table/CustomerReportTable.vue';
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
  customer: CustomerLite | null;
  startDate: string;
  endDate: string;
}) {
  // Private

  const { editDateFormat } = requiredConfigEntries('editDateFormat');
  const years = useSelectDateRange().yearOptions.value;

  const validationSchema = markRaw(
    object({
      customer: asIsRequired<CustomerLite>('Customer'),
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
    customer: null,
    startDate: date.formatDate(new Date(years[years.length - 1]!, 0, 1), editDateFormat),
    endDate: date.formatDate(
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
      editDateFormat,
    ),
  };

  // Composables

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  const store = useCustomersReportsStore();

  const { validate } = useValidation(initialValues);

  // Data

  const customer: Ref<CustomerLite | null> = ref(initialValues.customer);
  const startDate = ref(initialValues.startDate);
  const endDate = ref(initialValues.endDate);
  const report = ref(null) as Ref<Awaited<ReturnType<(typeof store)['rangeReport']>> | null>;
  const balancedInvoices = ref(true);
  const unbalancedInvoices = ref(true);

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

    if (!customer.value) {
      return;
    }

    freezed.value = true;
    report.value = null;
    balancedInvoices.value = true;
    unbalancedInvoices.value = true;

    try {
      report.value = await store.rangeReport(
        customer.value.id,
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
    store.releaseCustomersReports({ immediately: true });
    report.value = null;
  }

  // Lifecycle Hooks

  onUnmounted(() => {
    store.releaseCustomersReports({ immediately: false });
  });

  return {
    customer,
    startDate,
    endDate,
    report,
    balancedInvoices,
    unbalancedInvoices,
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

const { customerOptions, customersEditorDependenciesStore, filterCustomerOptions } =
  useCustomerOptions();

const { ready, freezed } = usePageStatus();

const {
  customer,
  startDate,
  endDate,
  report,
  balancedInvoices,
  unbalancedInvoices,
  hasReports,
  dateOptionsFn,
  loadReport,
  clearCache,
} = usePageData(freezed);

const { year, yearOptions } = useYearOptions(startDate, endDate, loadReport, 0);

// Computed

const reportTitle = computed(() =>
  report.value
    ? `Customer Report ${
        customerOptions.value.find((value) => value.id === report.value?.customerId)?.name
      } ${f.date(report.value.startDate)} - ${f.date(report.value.endDate)}`
    : '',
);

// Private Executions

customersEditorDependenciesStore.store
  .loadAllDocs(customersEditorDependenciesStore.payload)
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
                v-model="customer"
                class="col-12"
                :disable="freezed"
                fill-input
                hide-selected
                label="Customer"
                name="customer"
                option-label="name"
                option-value="id"
                :options="customerOptions"
                use-input
                @filter="filterCustomerOptions"
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
            <div v-if="(report?.content.details.length || 0) > 0">
              <q-separator />

              <q-card-section>
                <div class="q-col-gutter-md row">
                  <q-toggle
                    v-model="balancedInvoices"
                    checked-icon="fal fa-check"
                    class="col-6"
                    label="Balanced Invoices"
                    unchecked-icon="clear"
                  />
                  <q-toggle
                    v-model="unbalancedInvoices"
                    checked-icon="fal fa-check"
                    class="col-6"
                    label="Unbalanced Invoices"
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
                      <div>Ending Balance</div>
                      <div class="text-warning">
                        {{ f.currency(report.content.endingBalance) }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <div class="text-center">There is no data in the selected period of time.</div>
              </div>

              <CustomerReportTable
                v-else-if="isTableView"
                key="tableView"
                :balanced-invoices="balancedInvoices"
                :content="report.content"
                :report-title="reportTitle"
                :unbalanced-invoices="unbalancedInvoices"
              />

              <CustomerReportCards
                v-else-if="isCardsView"
                key="cardsView"
                :balanced-invoices="balancedInvoices"
                :content="report.content"
                :report-title="reportTitle"
                :unbalanced-invoices="unbalancedInvoices"
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

        <SwitchViewButton v-if="!!report && report.content.details.length > 0" key="switchView" />
      </template>
    </FloatToolbar>
  </QPagePadding>
</template>
