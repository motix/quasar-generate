<script setup lang="ts">
import { nextTick } from 'vue';

import type { FinanceAccountVm } from 'models/finance/index.js';

import { useFinanceAccountsStore } from 'stores/finance/FinanceAccounts.js';

import useNewPage from 'composables/crud-pages/useNewPage/index.js';

import FinanceAccountEditor from 'components/FinanceAccount/FinanceAccountEditor.vue';

// Constants

const SCOPE_NAME = 'finance-accounts-new-page';

// Private

function initialModel(): FinanceAccountVm {
  return {
    isActive: true,
    name: '',
    description: '',
    balanceRecords: [],
  };
}

// Composables

const store = useFinanceAccountsStore();

const $p = useNewPage<FinanceAccountVm>(SCOPE_NAME, true);

// Private Executions

// usePageStatus
void nextTick(() => {
  $p.ready.value = true;
});

// usePageData
$p.viewModel.value = initialModel();
$p.createModel.value = (payload) => {
  payload.idField = 'name';
  return store.createDoc(payload);
};

// useEditor
$p.viewUrl.value = './';

// useNavigateToListPage
$p.backUrl.value = '../finance-accounts';
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <FinanceAccountEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
