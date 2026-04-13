<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue';

import type { InvoiceGroup, InvoiceGroupVm } from 'models/finance/index.js';

import { useInvoiceGroupsStore } from 'stores/finance/InvoiceGroups.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import InvoiceGroupEditor from 'components/InvoiceGroup/InvoiceGroupEditor.vue';
import InvoiceGroupViewer from 'components/InvoiceGroup/InvoiceGroupViewer.vue';

// Constants

const SCOPE_NAME = 'invoice-groups-view-page';

// Private

const isActive = computed(() => $p.model.value?.isActive);

// Composables

const store = useInvoiceGroupsStore();

const { hasRole } = useFirebaseAuth();

const $p = useViewPage<InvoiceGroup, InvoiceGroupVm>(SCOPE_NAME, true);

// Private Executions

// useReturnUrl
$p.backUrl.value = '../invoice-groups';

// usePageFeatures
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

watch($p.editMode, () => {
  $p.hasMultiViews.value = false;
});

$p.watchViewer(isActive);
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <InvoiceGroupViewer :scope-name="SCOPE_NAME" />
      </template>
      <template #editor>
        <InvoiceGroupEditor :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
