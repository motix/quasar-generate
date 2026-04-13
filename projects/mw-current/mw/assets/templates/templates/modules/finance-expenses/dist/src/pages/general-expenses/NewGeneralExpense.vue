<script setup lang="ts">
import { nextTick } from 'vue';

import { date } from 'quasar';

import { expenseVmDefaultExtendedFields } from 'utils/finance/Expense/ExpenseDefaultExtendedFields';
import ExpenseStatus from 'utils/finance/Expense/ExpenseStatus.js';

import type { ExpenseVm } from 'models/finance/index.js';

import { useGeneralExpensesStore } from 'stores/finance/GeneralExpenses.js';

import { useExpenseNewPage } from 'composables/finance/expense/useExpenseEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import ExpenseEditor from 'components/Expense/ExpenseEditor.vue';

// Constants

const SCOPE_NAME = 'general-expenses-new-page';

// Private

function initialModel(): ExpenseVm {
  const createDate = date.formatDate(new Date(), editDateFormat);

  class StatusClass extends ExpenseStatus<ExpenseVm> {}

  return StatusClass.newContainer(
    StatusClass,
    {
      isArchived: false,
      code: '',
      createDate,
      issueDate: createDate,
      isCompleted: false,
      isApproved: false,
      isRejected: false,
      isCancelled: false,
      isCapitalWithdrawal: false,
      isExternal: false,
      supplierExtraInfo: '',
      content: '',
      discount: '',
      vatPercent: '',
      vatableAmount: '',
      secondVatPercent: '',
      secondVatableAmount: '',
      vatAdjustment: '',
      notes: '',
      details: [],
      transactions: [],
      listKey: null,
      ...expenseVmDefaultExtendedFields(),
    },
    [],
  );
}

// Composables

const store = useGeneralExpensesStore();

const { editDateFormat } = requiredConfigEntries('editDateFormat');

const $p = useExpenseNewPage(SCOPE_NAME, false, true);

// Private Executions

// usePageStatus
void nextTick(() => {
  $p.ready.value = true;
});

// usePageData
$p.viewModel.value = initialModel();
$p.createModel.value = async (payload) => {
  await $p.viewModelBeforeCreate(payload);
  return await store.createDoc(payload);
};

// useEditor
$p.viewUrl.value = './';
$p.modelFindKeyField.value = 'code';

// useNavigateToListPage
$p.backUrl.value = '../general-expenses';
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <ExpenseEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
