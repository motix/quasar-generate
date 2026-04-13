<script setup lang="ts">
import { nextTick } from 'vue';

import type { SupplierVm } from 'models/finance/index.js';

import { useSuppliersStore } from 'stores/finance/Suppliers.js';

import useNewPage from 'composables/crud-pages/useNewPage/index.js';

import SupplierEditor from 'components/Supplier/SupplierEditor.vue';

// Constants

const SCOPE_NAME = 'suppliers-new-page';

// Private

function initialModel(): SupplierVm {
  return {
    isActive: true,
    code: '',
    name: '',
  };
}

// Composables

const store = useSuppliersStore();

const $p = useNewPage<SupplierVm>(SCOPE_NAME, true);

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
$p.backUrl.value = '../suppliers';
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <SupplierEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
