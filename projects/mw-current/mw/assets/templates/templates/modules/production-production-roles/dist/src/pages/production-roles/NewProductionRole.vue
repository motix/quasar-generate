<script setup lang="ts">
import { nextTick } from 'vue';

import type { ProductionRoleVm } from 'models/production/index.js';

import { useProductionRolesStore } from 'stores/production/ProductionRoles.js';

import useNewPage from 'composables/crud-pages/useNewPage/index.js';

import ProductionRoleEditor from 'components/ProductionRole/ProductionRoleEditor.vue';

// Constants

const SCOPE_NAME = 'production-roles-new-page';

// Private

function initialModel(): ProductionRoleVm {
  return {
    isActive: true,
    name: '',
    position: '',
  };
}

// Composables

const store = useProductionRolesStore();

const $p = useNewPage<ProductionRoleVm>(SCOPE_NAME, true);

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
$p.backUrl.value = '../production-roles';
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <ProductionRoleEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
