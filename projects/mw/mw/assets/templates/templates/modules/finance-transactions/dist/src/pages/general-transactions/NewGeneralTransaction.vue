<script setup lang="ts">
import { nextTick } from 'vue';

import { date } from 'quasar';

import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { TransactionVm } from 'models/finance/index.js';

import { useGeneralTransactionsStore } from 'stores/finance/GeneralTransactions.js';

import { generateCode } from 'services/global/index.js';

import { useTransactionNewPage } from 'composables/finance/transaction/useTransactionEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import TransactionEditor from 'components/Transaction/TransactionEditor.vue';

// Constants

const SCOPE_NAME = 'general-transactions-new-page';

// Private

function initialModel(): TransactionVm {
  const createDate = date.formatDate(new Date(), editDateFormat);

  class StatusClass extends TransactionStatus<TransactionVm> {}

  return StatusClass.newContainer(
    StatusClass,
    {
      isArchived: false,
      code: '',
      createDate,
      issueDate: createDate,
      type: 'Transfer',
      isCleared: false,
      isCancelled: false,
      content: '',
      notes: '',
      sourceFinanceAccount: null,
      destinationFinanceAccount: null,
      details: [],
      listKey: null,
    },
    [],
  );
}

// Composables

const store = useGeneralTransactionsStore();

const { editDateFormat } = requiredConfigEntries('editDateFormat');

const $p = useTransactionNewPage(SCOPE_NAME, false, true);

// Private Executions

// usePageStatus
void nextTick(() => {
  $p.ready.value = true;
});

// usePageData
$p.viewModel.value = initialModel();
$p.createModel.value = async (payload) => {
  $p.vm.value.code = await generateCode(
    'TS',
    date.formatDate(date.extractDate($p.vm.value.createDate, editDateFormat), '.YY.MM.DD'),
  );

  if (!$p.vmc.transactionHasSourceAccount($p.vm.value)) {
    $p.vm.value.sourceFinanceAccount = null;
  }

  if (!$p.vmc.transactionHasDestinationAccount($p.vm.value)) {
    $p.vm.value.destinationFinanceAccount = null;
  }

  return await store.createDoc(payload);
};

// useEditor
$p.viewUrl.value = './';
$p.modelFindKeyField.value = 'code';

// useNavigateToListPage
$p.backUrl.value = '../general-transactions';
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <TransactionEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
