<script setup lang="ts">
import { onUnmounted } from 'vue';

import { date, uid } from 'quasar';

import { sortBy } from 'lodash-es';

import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { ProjectVm, TransactionVm } from 'models/finance/index.js';

import { useProjectsStore } from 'stores/finance/Projects.js';

import { generateCode } from 'services/global/index.js';

import { useTransactionNewPage } from 'composables/finance/transaction/useTransactionEditPage.js';
import { useTransactionNewPage_ProjectTransactions } from 'composables/finance/transaction/useTransactionEditPage_ProjectTransactions.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import TransactionEditor from 'components/Transaction/TransactionEditor.vue';
import TransactionEditorMain_ProjectTransactions from 'components/Transaction/TransactionEditorMain_ProjectTransactions.vue';

// Constants

const SCOPE_NAME = 'project-transactions-new-page';

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
      type: $p.invoice.value ? 'Receipt' : $p.expense.value ? 'Payment' : 'Transfer',
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

const store = useProjectsStore();

const { editDateFormat } = requiredConfigEntries('editDateFormat');

useTransactionNewPage<true, ProjectVm>(SCOPE_NAME, true, true);
const $p = useTransactionNewPage_ProjectTransactions(SCOPE_NAME);

// Private Executions

// useEditor
$p.modelFindKeyField.value = 'code';

// useNewChildPage
$p.parentModelFindKeyField.value = 'urlFriendlyName';
$p.parentViewModelGetter.value = (parentDocKey) => store.docVm(parentDocKey);
$p.addChild.value = (child) => {
  $p.invoice.value && $p.invoice.value.transactions.push(child);
  $p.expense.value && $p.expense.value.transactions.push(child);
};
$p.updateParentModel.value = async (payload) => {
  if ($p.invoice.value) {
    $p.invoice.value.customer === undefined &&
      (() => {
        throw new Error('customer not specified');
      })();

    $p.vm.value.code = await generateCode(
      'TS',
      date.formatDate(date.extractDate($p.vm.value.createDate, editDateFormat), '.YY.MM.DD'),
      $p.invoice.value.customer.code.toUpperCase(),
    );
  } else if ($p.expense.value) {
    $p.expense.value.supplier === undefined &&
      (() => {
        throw new Error('supplier not specified');
      })();

    $p.vm.value.code = await generateCode(
      'TS',
      date.formatDate(date.extractDate($p.vm.value.createDate, editDateFormat), '.YY.MM.DD'),
      $p.expense.value.supplier.code.toUpperCase(),
    );
  } else {
    $p.vm.value.code = await generateCode(
      'TS',
      date.formatDate(date.extractDate($p.vm.value.createDate, editDateFormat), '.YY.MM.DD'),
    );
  }

  if (!$p.vmc.transactionHasSourceAccount($p.vm.value)) {
    $p.vm.value.sourceFinanceAccount = null;
  }

  if (!$p.vmc.transactionHasDestinationAccount($p.vm.value)) {
    $p.vm.value.destinationFinanceAccount = null;
  }

  $p.invoice.value &&
    ($p.invoice.value.transactions = sortBy($p.invoice.value.transactions, (value) =>
      date.extractDate(value.issueDate, editDateFormat),
    ));

  $p.expense.value &&
    ($p.expense.value.transactions = sortBy($p.expense.value.transactions, (value) =>
      date.extractDate(value.issueDate, editDateFormat),
    ));

  await store.updateDoc(payload);
};

// useTransactionEditPageExtra
$p.isForProject.value = true;

$p.loadParentModel((payload) => store.loadRealtimeDoc(payload))
  .then(() => {
    if (
      $p.pvm.value.quotations.some((value) => value.invoice?.code === $p.directParentFindKey.value)
    ) {
      $p.hasCustomer.value = true;
    }

    if ($p.pvm.value.expenses.some((value) => value.code === $p.directParentFindKey.value)) {
      $p.hasSupplier.value = true;
    }

    $p.viewModel.value = initialModel();
    $p.viewUrl.value = `/project-transactions/${$p.pvm.value.urlFriendlyName}/`;
    $p.backUrl.value = `/projects/${$p.pvm.value.urlFriendlyName}`;
    $p.ready.value = true;
  })
  .catch(() => {
    throw new Error('[finance-project-transactions] Failed to load parent model');
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
        :transaction-editor-main-component="TransactionEditorMain_ProjectTransactions"
      />
    </NewPage>
  </QPagePadding>
</template>
