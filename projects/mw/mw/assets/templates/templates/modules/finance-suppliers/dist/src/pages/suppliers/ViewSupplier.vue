<script setup lang="ts">
import { computed, onUnmounted } from 'vue';

import type { Supplier, SupplierVm } from 'models/finance/index.js';

import { useSuppliersStore } from 'stores/finance/Suppliers.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import SupplierEditor from 'components/Supplier/SupplierEditor.vue';
import SupplierViewer from 'components/Supplier/SupplierViewer.vue';

// Constants

const SCOPE_NAME = 'suppliers-view-page';

// Private

const isActive = computed(() => $p.model.value?.isActive);

// Composables

const store = useSuppliersStore();

const { hasRole } = useFirebaseAuth();

const $p = useViewPage<Supplier, SupplierVm>(SCOPE_NAME, true);

// Private Executions

// useReturnUrl
$p.backUrl.value = '../suppliers';

// usePageFeatures
$p.hasDeleting.value = hasRole('manager');

// usePageData
$p.modelFindKeyField.value = 'code';
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
        <SupplierViewer :scope-name="SCOPE_NAME" />
      </template>
      <template #editor>
        <SupplierEditor :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
