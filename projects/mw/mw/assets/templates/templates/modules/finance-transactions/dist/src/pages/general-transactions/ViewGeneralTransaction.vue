<script setup lang="ts">
import { computed, onUnmounted, watchEffect } from 'vue';

import { Dark, uid } from 'quasar';

import { useGeneralTransactionsStore } from 'stores/finance/GeneralTransactions.js';

import { useTransactionViewPage } from 'composables/finance/transaction/useTransactionEditPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import TransactionEditor from 'components/Transaction/TransactionEditor.vue';
import TransactionViewer from 'components/Transaction/TransactionViewer.vue';

// Constants

const SCOPE_NAME = 'general-transactions-view-page';

// Private

const isArchived = computed(() => $p.model.value?.isArchived);

// Composables

const store = useGeneralTransactionsStore();

const { hasRole, roles } = useFirebaseAuth();

const $p = useTransactionViewPage(SCOPE_NAME, false, true);
const {
  // Auto sort
  addDetail,
  showAddDetailButton,
} = $p;

// Private Executions

// useReturnUrl
$p.backUrl.value = '../general-transactions';

// usePageData
$p.modelFindKeyField.value = 'code';
$p.modelGetter.value = (docKey) => {
  const model = store.doc(docKey);
  model.statusHelper.setUserRoles(roles.value);
  return model;
};
$p.viewModelGetter.value = (docKey) => {
  const viewModel = store.docVm(docKey);

  viewModel.details.forEach((detail, detailIndex) => {
    detail.key = $p.viewModel.value?.details[detailIndex]?.key || uid();
  });

  return viewModel;
};
$p.updateModel.value = async (payload) => {
  if (payload.isViewModel) {
    if (!$p.vmc.transactionHasSourceAccount($p.vm.value)) {
      $p.vm.value.sourceFinanceAccount = null;
    }

    if (!$p.vmc.transactionHasDestinationAccount($p.vm.value)) {
      $p.vm.value.destinationFinanceAccount = null;
    }
  }

  return await store.updateDoc(payload);
};
$p.deleteModel.value = (payload) => store.deleteDoc(payload);

// usePageTitle
$p.modelNameField.value = 'code';

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

watchEffect(() => {
  $p.hasEditor.value = !!$p.model.value && !$p.model.value.isArchived;

  $p.hasDeleting.value =
    hasRole('manager') &&
    !!$p.model.value &&
    !$p.model.value.isArchived &&
    $p.m.value.statusHelper.statusName === 'cancelled';

  $p.hasMultiViews.value = $p.hasDetails.value;
});

watchEffect(() => {
  $p.readonlyMode.value = !!$p.model.value?.isArchived;
});

$p.watchViewer(isArchived);
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <TransactionViewer :scope-name="SCOPE_NAME" />
      </template>
      <template #editor>
        <TransactionEditor :scope-name="SCOPE_NAME" />
      </template>

      <template #toolbar-extra>
        <q-btn
          v-show="showAddDetailButton"
          key="addDetail"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          icon="fal fa-plus"
          outline
          padding="sm"
          text-color="primary"
          @click="addDetail"
        >
          <TopTooltip>Add Detail</TopTooltip>
        </q-btn>
      </template>
    </ViewPage>
  </QPagePadding>
</template>
