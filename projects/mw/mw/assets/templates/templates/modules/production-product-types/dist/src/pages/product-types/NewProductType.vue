<script setup lang="ts">
import { nextTick } from 'vue';

import type { ProductTypeVm } from 'models/production/index.js';

import { useProductTypesStore } from 'stores/production/ProductTypes.js';

import useNewPage from 'composables/crud-pages/useNewPage/index.js';

import ProductTypeEditor from 'components/ProductType/ProductTypeEditor.vue';

// Constants

const SCOPE_NAME = 'product-types-new-page';

// Private

function initialModel(): ProductTypeVm {
  return {
    isActive: true,
    name: '',
    position: '',
  };
}

// Composables

const store = useProductTypesStore();

const $p = useNewPage<ProductTypeVm>(SCOPE_NAME, true);

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
$p.backUrl.value = '../product-types';
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <ProductTypeEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
