<script setup lang="ts">
import { computed, onUnmounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { Dark, uid } from 'quasar';

import { useGeneralInvoicesStore } from 'stores/finance/GeneralInvoices.js';

import {
  invoiceEditPageComponentStore,
  useInvoiceViewPage,
} from 'composables/finance/invoice/useInvoiceEditPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import AddTransactionToolbarButton from 'components/Invoice/AddTransactionToolbarButton.vue';
import InvoiceEditor from 'components/Invoice/InvoiceEditor.vue';
import InvoiceViewer from 'components/Invoice/InvoiceViewer.vue';

// Constants

const SCOPE_NAME = 'general-invoices-view-page';

// Private

const isArchived = computed(() => $p.model.value?.isArchived);
const isRequired = computed(() => $p.model.value?.isRequired);
const isCapitalContribution = computed(() => $p.model.value?.isCapitalContribution);
const isExternal = computed(() => $p.model.value?.isExternal);

// Composables

const { meta } = useRoute();
const store = useGeneralInvoicesStore();

const { hasRole, roles } = useFirebaseAuth();

const $p = useInvoiceViewPage(SCOPE_NAME, false, true);
const {
  // Auto sort
  addDetail,
  showAddDetailButton,
} = $p;

// Private Executions

// useReturnUrl
$p.backUrl.value = '../general-invoices';

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
  await $p.modelBeforeUpdate(payload);
  await store.updateDoc(payload);
};
$p.deleteModel.value = (payload) => {
  if (meta.history) {
    meta.history = meta.history.filter(
      (value) =>
        value !== `/general-invoices/${$p.m.value.code.replaceAll('.', '_')}` &&
        !value.startsWith(`/general-invoice-transactions/${$p.m.value.code.replaceAll('.', '_')}/`),
    );
  }

  return store.deleteDoc(payload);
};

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
    $p.m.value.statusHelper.statusName === 'cancelled' &&
    $p.m.value.transactions.every((value) => value.statusHelper.statusName === 'cancelled');

  $p.hasMultiViews.value = $p.anyCollectionHasItems.value;
});

watchEffect(() => {
  $p.readonlyMode.value = !!$p.model.value?.isArchived;
});

$p.watchFindKey();

$p.watchViewer(isArchived, isRequired, isCapitalContribution, isExternal);
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <component
          :is="invoiceEditPageComponentStore.invoiceViewer || InvoiceViewer"
          :scope-name="SCOPE_NAME"
        />
      </template>
      <template #editor>
        <InvoiceEditor :scope-name="SCOPE_NAME" />
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

        <AddTransactionToolbarButton :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
