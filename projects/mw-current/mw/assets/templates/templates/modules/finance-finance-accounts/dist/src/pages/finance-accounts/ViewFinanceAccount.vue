<script setup lang="ts">
import { computed, onUnmounted } from 'vue';

import type { FinanceAccount, FinanceAccountVm } from 'models/finance/index.js';

import { useFinanceAccountsStore } from 'stores/finance/FinanceAccounts.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import FinanceAccountEditor from 'components/FinanceAccount/FinanceAccountEditor.vue';
import FinanceAccountViewer from 'components/FinanceAccount/FinanceAccountViewer.vue';

// Constants

const SCOPE_NAME = 'finance-accounts-view-page';

// Private

const isActive = computed(() => $p.model.value?.isActive);

// Composables

const store = useFinanceAccountsStore();

const { hasRole } = useFirebaseAuth();

const $p = useViewPage<FinanceAccount, FinanceAccountVm>(SCOPE_NAME, true);

// Private Executions

// useReturnUrl
$p.backUrl.value = '../finance-accounts';

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

$p.watchViewer(isActive);
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <FinanceAccountViewer :scope-name="SCOPE_NAME" />
      </template>
      <template #editor>
        <FinanceAccountEditor :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
