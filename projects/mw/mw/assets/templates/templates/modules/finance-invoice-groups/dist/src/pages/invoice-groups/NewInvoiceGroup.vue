<script setup lang="ts">
import { nextTick } from 'vue';

import type { InvoiceGroupVm } from 'models/finance/index.js';

import { useInvoiceGroupsStore } from 'stores/finance/InvoiceGroups.js';

import useNewPage from 'composables/crud-pages/useNewPage/index.js';

import InvoiceGroupEditor from 'components/InvoiceGroup/InvoiceGroupEditor.vue';

// Constants

const SCOPE_NAME = 'invoice-groups-new-page';

// Private

function initialModel(): InvoiceGroupVm {
  return {
    isActive: true,
    name: '',
    description: '',
  };
}

// Composables

const store = useInvoiceGroupsStore();

const $p = useNewPage<InvoiceGroupVm>(SCOPE_NAME, true);

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
$p.backUrl.value = '../invoice-groups';
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <InvoiceGroupEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
