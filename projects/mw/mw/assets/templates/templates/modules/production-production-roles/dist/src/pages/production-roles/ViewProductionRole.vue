<script setup lang="ts">
import { computed, onUnmounted } from 'vue';

import type { ProductionRole, ProductionRoleVm } from 'models/production/index.js';

import { useProductionRolesStore } from 'stores/production/ProductionRoles.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import ProductionRoleEditor from 'components/ProductionRole/ProductionRoleEditor.vue';
import ProductionRoleViewer from 'components/ProductionRole/ProductionRoleViewer.vue';

// Constants

const SCOPE_NAME = 'production-roles-view-page';

// Private

const isActive = computed(() => $p.model.value?.isActive);

// Composables

const store = useProductionRolesStore();

const { hasRole } = useFirebaseAuth();

const $p = useViewPage<ProductionRole, ProductionRoleVm>(SCOPE_NAME, true);

// Private Executions

// useReturnUrl
$p.backUrl.value = '../production-roles';

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
        <ProductionRoleViewer :scope-name="SCOPE_NAME" />
      </template>
      <template #editor>
        <ProductionRoleEditor :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
