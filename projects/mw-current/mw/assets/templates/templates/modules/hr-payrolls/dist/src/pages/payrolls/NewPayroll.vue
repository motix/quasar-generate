<script setup lang="ts">
import { nextTick, watchEffect } from 'vue';

import { date } from 'quasar';

import PayrollStatus from 'utils/hr/payroll/PayrollStatus.js';

import type { PayrollVm } from 'models/hr/index.js';

import { usePayrollsStore } from 'stores/hr/Payrolls.js';

import useNewPage from 'composables/crud-pages/useNewPage/index.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import PayrollEditor from 'components/Payroll/PayrollEditor.vue';

// Constants

const SCOPE_NAME = 'payrolls-new-page';

// Private

function initialModel(): PayrollVm {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  class StatusClass extends PayrollStatus<PayrollVm> {}

  return StatusClass.newContainer(
    StatusClass,
    {
      year,
      month,
      isCompleted: false,
      isApproved: false,
      isRejected: false,
      isCancelled: false,
      socialInsurancePercent: defaultSocialInsurancePercent,
      unionDuesPercent: defaultUnionDuesPercent,
      workingDays: calculateWorkingDays(year, month),
      details: [],
    },
    [],
  );
}

// Composables

const { payday, defaultSocialInsurancePercent, defaultUnionDuesPercent } = requiredConfigEntries(
  'payday',
  'defaultSocialInsurancePercent',
  'defaultUnionDuesPercent',
);

const store = usePayrollsStore();

const $p = useNewPage<PayrollVm>(SCOPE_NAME, true);

// Private Executions

// usePageStatus
void nextTick(() => {
  $p.ready.value = true;
});

// usePageData
$p.viewModel.value = initialModel();
$p.createModel.value = (payload) => store.createDoc(payload);

// useEditor
$p.viewUrl.value = './';
$p.modelFindKeyField.value = 'code';
$p.initiallyFilled.value = true;

// useNavigateToListPage
$p.backUrl.value = '../payrolls';

// Methods

function calculateWorkingDays(year: number, month: number) {
  const endDate = new Date(year, month - 1, payday);
  const startDate = date.addToDate(endDate, { days: 1, months: -1 });
  let workingDays = 0;
  let currentDate = startDate;

  while (date.getDateDiff(endDate, currentDate, 'days') >= 0) {
    const day = date.getDayOfWeek(currentDate);

    if (day !== 6 && day !== 7) workingDays++;

    currentDate = date.addToDate(currentDate, { days: 1 });
  }

  return workingDays;
}

// Watch

watchEffect(() => {
  if ($p.viewModel.value) {
    $p.viewModel.value.workingDays = calculateWorkingDays(
      $p.viewModel.value.year as number,
      $p.viewModel.value.month as number,
    );
  }
});
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <PayrollEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
