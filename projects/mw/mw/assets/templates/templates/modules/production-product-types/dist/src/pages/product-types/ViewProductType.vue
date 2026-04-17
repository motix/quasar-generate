<script setup lang="ts">
import { computed, onUnmounted } from 'vue';

import type { ProductType, ProductTypeVm } from 'models/production/index.js';

import { useProductTypesStore } from 'stores/production/ProductTypes.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import ProductTypeEditor from 'components/ProductType/ProductTypeEditor.vue';
import ProductTypeViewer from 'components/ProductType/ProductTypeViewer.vue';

// Constants

const SCOPE_NAME = 'product-types-view-page';

// Private

const isActive = computed(() => $p.model.value?.isActive);

// Composables

const store = useProductTypesStore();

const { hasRole } = useFirebaseAuth();

const $p = useViewPage<ProductType<never>, ProductTypeVm>(SCOPE_NAME, true);

// Private Executions

// useReturnUrl
$p.backUrl.value = '../product-types';

// usePageFeatures
$p.hasEditor.value = hasRole('maintenance');
$p.hasDeleting.value = hasRole('manager');

// usePageData
$p.modelGetter.value = (docKey) => store.doc(docKey);
$p.viewModelGetter.value = (docKey) => store.docVm(docKey);
$p.updateModel.value = (payload) => store.updateDoc(payload);
$p.deleteModel.value = (payload) => store.deleteDoc(payload);

// usePageTitle
$p.modelNameField.value = 'name';

// usePageData - loadModel
void $p
  .loadModel((payload) => store.loadRealtimeDoc(payload))
  .then(() => {
    $p.ready.value = true;
  });

// Lifecycle Hooks

onUnmounted(() => {
  $p.releaseModel.value && $p.releaseModel.value();
});

// Watch

$p.watchViewer(isActive);
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <ProductTypeViewer :scope-name="SCOPE_NAME" />
      </template>
      <template #editor>
        <ProductTypeEditor :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
