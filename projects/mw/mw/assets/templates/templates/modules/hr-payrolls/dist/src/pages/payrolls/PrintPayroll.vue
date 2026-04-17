<script setup lang="ts">
import { onUnmounted } from 'vue';

import { useMeta } from 'quasar';

import type { Payroll } from 'models/hr/index.js';

import { usePayrollsStore } from 'stores/hr/Payrolls.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import usePayrollCalculator from 'composables/hr/payroll/usePayrollCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import PayrollDetailsViewerInnerTable from 'components/Payroll/table/PayrollDetailsViewerInnerTable.vue';

// Constants

const SCOPE_NAME = 'payrolls-print-page';

// Composables

const store = usePayrollsStore();

const { appName, cardWidth } = requiredConfigEntries('appName', 'cardWidth');

const f = useFormats();

const mc = usePayrollCalculator<Payroll>();

const $p = useViewPage<Payroll, never>(SCOPE_NAME, true);
const {
  // Auto sort
  m,
  model,
  ready,
} = $p;

// Private Executions

useMeta(() => ({
  title: `Print Payroll - ${appName}`,
}));

// usePageFeatures
$p.hasEditor.value = false;

// usePageData
$p.modelFindKeyField.value = 'code';
$p.modelGetter.value = (docKey) => store.doc(docKey);

// usePageData - loadModel
void $p
  .loadModel((payload) => store.loadRealtimeDoc(payload))
  .then(() => {
    $p.ready.value = true;

    setTimeout(() => {
      if (!!model.value && !m.value.isCancelled) {
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
        Payroll is not available. Please contact support.
      </div>

      <div v-else key="ready" class="q-gutter-y-lg">
        <!-- Title -->
        <div class="text-right q-pt-xl">
          <div class="text-h5 text-weight-light">
            {{ f.yearMonth(model.year, model.month) }}
          </div>
          <div class="text-caption text-weight-light">Printed on: {{ f.date(new Date()) }}</div>
        </div>

        <section v-if="m.isCancelled" class="text-negative text-center text-uppercase">
          This Payroll is cancelled!
        </section>

        <!-- Summary -->
        <q-list bordered class="q-mx-auto" separator :style="{ maxWidth: cardWidth + 'px' }">
          <q-item>
            <q-item-section>Working Days</q-item-section>
            <q-item-section class="text-right">
              {{ model.workingDays }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Social Insurance Rate</q-item-section>
            <q-item-section class="text-right">
              {{ f.percent(model.socialInsurancePercent) }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Base Salary</q-item-section>
            <q-item-section class="text-right">
              {{ f.currency(mc.payrollTotalBaseSalary(model)) }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Production Salary</q-item-section>
            <q-item-section class="text-right">
              {{ f.currency(mc.payrollTotalProductionSalary(model)) }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Bonus</q-item-section>
            <q-item-section class="text-right">
              {{ f.currency(mc.payrollTotalBonus(model)) }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Social Insurance</q-item-section>
            <q-item-section class="text-right">
              {{ f.currency(mc.payrollTotalSocialInsurance(model), true) }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Personal Income Tax</q-item-section>
            <q-item-section class="text-right">
              {{ f.currency(mc.payrollTotalPersonalIncomeTax(model), true) }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Union Dues</q-item-section>
            <q-item-section class="text-right">
              {{ f.currency(mc.payrollTotalUnionDues(model), true) }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Adjustment</q-item-section>
            <q-item-section class="text-right">
              {{ f.currency(mc.payrollTotalAdjustment(model), true) }}
            </q-item-section>
          </q-item>
          <q-item class="text-bold">
            <q-item-section>Net Salary</q-item-section>
            <q-item-section class="text-right">
              {{ f.currency(mc.payrollTotalNetSalary(model)) }}
            </q-item-section>
          </q-item>
          <q-item class="text-bold">
            <q-item-section>Payable</q-item-section>
            <q-item-section class="text-right">
              {{ f.currency(mc.payrollTotalPayable(model)) }}
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Main -->
        <PayrollDetailsViewerInnerTable printer-friendly :scope-name="SCOPE_NAME" />
      </div>
    </FadeTransition>
  </div>
</template>
