<script setup lang="ts">
import { computed, onUnmounted } from 'vue';

import type { Customer, CustomerVm } from 'models/finance/index.js';

import { useCustomersStore } from 'stores/finance/Customers.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import CustomerEditor from 'components/Customer/CustomerEditor.vue';
import CustomerViewer from 'components/Customer/CustomerViewer.vue';

// Constants

const SCOPE_NAME = 'customers-view-page';

// Private

const isActive = computed(() => $p.model.value?.isActive);

// Composables

const store = useCustomersStore();

const { hasRole } = useFirebaseAuth();

const $p = useViewPage<Customer, CustomerVm>(SCOPE_NAME, true);

// Private Executions

// useReturnUrl
$p.backUrl.value = '../customers';

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
        <CustomerViewer :scope-name="SCOPE_NAME" />
      </template>
      <template #editor>
        <CustomerEditor :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
