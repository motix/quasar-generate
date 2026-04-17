<script setup lang="ts">
import { onUnmounted } from 'vue';

import { date, uid } from 'quasar';

import { sortBy } from 'lodash-es';

import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { ExpenseVm, TransactionVm } from 'models/finance/index.js';

import { useGeneralExpensesStore } from 'stores/finance/GeneralExpenses.js';

import { generateCode } from 'services/global/index.js';

import { useTransactionNewPage } from 'composables/finance/transaction/useTransactionEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import TransactionEditor from 'components/Transaction/TransactionEditor.vue';
import TransactionEditorMain_Expenses from 'components/Transaction/TransactionEditorMain_Expenses.vue';

// Constants

const SCOPE_NAME = 'general-transactions-new-page';

// Private

function initialModel(): TransactionVm {
  $p.parentViewModel.value === null &&
    (() => {
      throw new Error('parentViewModel not specified');
    })();

  const createDate = date.formatDate(new Date(), editDateFormat);

  class StatusClass extends TransactionStatus<TransactionVm> {}

  return StatusClass.newContainer(
    StatusClass,
    {
      id: '_',
      isArchived: false,
      code: '',
      createDate,
      issueDate: createDate,
      type: 'Payment',
      isCleared: false,
      isCancelled: false,
      content: '',
      notes: '',
      sourceFinanceAccount: null,
      destinationFinanceAccount: null,
      details: [],
      listKey: uid(),
    },
    [],
  );
}

// Composables

const store = useGeneralExpensesStore();

const { editDateFormat } = requiredConfigEntries('editDateFormat');

const $p = useTransactionNewPage<true, ExpenseVm>(SCOPE_NAME, true, true);

// Private Executions

// useEditor
$p.modelFindKeyField.value = 'code';

// useNewChildPage
$p.parentModelFindKeyField.value = 'code';
$p.parentViewModelGetter.value = (parentDocKey) => store.docVm(parentDocKey);
$p.addChild.value = (child) => $p.pvm.value.transactions.push(child);
$p.updateParentModel.value = async (payload) => {
  $p.pvm.value.supplier === undefined &&
    (() => {
      throw new Error('supplier not specified');
    })();

  $p.vm.value.code = await generateCode(
    'TS',
    date.formatDate(date.extractDate($p.vm.value.createDate, editDateFormat), '.YY.MM.DD'),
    $p.pvm.value.supplier.code.toUpperCase(),
  );

  if (!$p.vmc.transactionHasSourceAccount($p.vm.value)) {
    $p.vm.value.sourceFinanceAccount = null;
  }

  if (!$p.vmc.transactionHasDestinationAccount($p.vm.value)) {
    $p.vm.value.destinationFinanceAccount = null;
  }

  $p.pvm.value.transactions = sortBy($p.pvm.value.transactions, (value) =>
    date.extractDate(value.issueDate, editDateFormat),
  );

  await store.updateDoc(payload);
};

// useTransactionEditPageExtra
$p.hasSupplier.value = true;

$p.loadParentModel((payload) => store.loadRealtimeDoc(payload))
  .then(() => {
    $p.viewModel.value = initialModel();
    $p.viewUrl.value = `/general-expense-transactions/${$p.pvm.value.code.replaceAll('.', '_')}/`;
    $p.backUrl.value = `/general-expenses/${$p.pvm.value.code.replaceAll('.', '_')}`;
    $p.ready.value = true;
  })
  .catch(() => {
    throw new Error('[finance-expenses] Failed to load parent model');
  });

// Lifecycle Hooks

onUnmounted(() => {
  $p.releaseParentModel.value && $p.releaseParentModel.value();
});
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <TransactionEditor
        :scope-name="SCOPE_NAME"
        :transaction-editor-main-component="TransactionEditorMain_Expenses"
      />
    </NewPage>
  </QPagePadding>
</template>
