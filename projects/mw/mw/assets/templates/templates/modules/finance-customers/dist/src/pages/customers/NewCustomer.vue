<script setup lang="ts">
import { nextTick } from 'vue';

import type { CustomerVm } from 'models/finance/index.js';

import { useCustomersStore } from 'stores/finance/Customers.js';

import useNewPage from 'composables/crud-pages/useNewPage/index.js';

import CustomerEditor from 'components/Customer/CustomerEditor.vue';

// Constants

const SCOPE_NAME = 'customers-new-page';

// Private

function initialModel(): CustomerVm {
  return {
    isActive: true,
    code: '',
    name: '',
  };
}

// Composables

const store = useCustomersStore();

const $p = useNewPage<CustomerVm>(SCOPE_NAME, true);

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

// useNavigateToListPage
$p.backUrl.value = '../customers';
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <CustomerEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
