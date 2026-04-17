<script setup lang="ts">
import { onUnmounted } from 'vue';

import type { Customer } from 'models/production/index.js';

import { useCustomersStore } from 'stores/production/Customers.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';

import CustomerViewer from 'components/Customer/CustomerViewer.vue';

// Constants

const SCOPE_NAME = 'accounts-view-page';

// Composables

const store = useCustomersStore();

const $p = useViewPage<Customer, never>(SCOPE_NAME, true);

// Private Executions

// useReturnUrl
$p.backUrl.value = '../customers';

// usePageFeatures
$p.hasEditor.value = false;
$p.hasDeleting.value = false;

// usePageData
$p.modelFindKeyField.value = 'code';
$p.modelGetter.value = (docKey) => store.doc(docKey);

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
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <CustomerViewer :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
