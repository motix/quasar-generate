<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { faListOl } from '@fortawesome/pro-light-svg-icons';
import { faBolt } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

import { onUnmounted, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { Dark, date, uid } from 'quasar';

import { sortBy } from 'lodash-es';

import type { Invoice, InvoiceVm } from 'models/finance/index.js';

import { useGeneralInvoicesStore } from 'stores/finance/GeneralInvoices.js';

import { useTransactionViewPage } from 'composables/finance/transaction/useTransactionEditPage.js';
import { useTransactionViewPage_Invoices } from 'composables/finance/transaction/useTransactionEditPage_Invoices.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import TransactionEditor from 'components/Transaction/TransactionEditor.vue';
import TransactionEditorMain_Invoices from 'components/Transaction/TransactionEditorMain_Invoices.vue';
import TransactionViewer from 'components/Transaction/TransactionViewer_Invoices.vue';

// Constants

const SCOPE_NAME = 'general-invoice-transactions-view-page';

// Composables

const { meta } = useRoute();
const store = useGeneralInvoicesStore();

const { editDateFormat } = requiredConfigEntries('editDateFormat');

const { hasRole, roles } = useFirebaseAuth();

useTransactionViewPage<true, Invoice, InvoiceVm>(SCOPE_NAME, true, true);
const $p = useTransactionViewPage_Invoices<true>(SCOPE_NAME);
const {
  // Auto sort
  addDetail,
  childViewerRef,
  deleteChild,
  deleting,
  fillDetailsFromParent,
  fillDetailsFromParentButtonLabel,
  findKey,
  findKeyOptions,
  freezed,
  m,
  showAddDetailButton,
  showDeleteButton,
  showFillDetailsFromParentButton,
} = $p;

// Private Executions

library.add(faListOl, faBolt);

// useReturnUrl
$p.backUrl.value = '/general-invoice-transactions';

// usePageFeatures
// Hide predefined trash button
$p.hasDeleting.value = false;

// usePageData
$p.modelFindKeyField.value = 'code';

// usePageTitle
$p.modelNameField.value = 'code';

// useToolbar
$p.toolbarPersistent.value = true;

// useViewChildPage
$p.parentModelFindKeyField.value = 'code';
$p.viewUrl.value = '/general-invoice-transactions/';
$p.parentModelGetter.value = (docKey) => {
  const parentModel = store.doc(docKey);

  parentModel.transactions.forEach((value) => value.statusHelper.setUserRoles(roles.value));

  return parentModel;
};
$p.parentViewModelGetter.value = (docKey) => {
  const parentViewModel = store.docVm(docKey);

  parentViewModel.transactions.forEach((transaction, transactionIndex) =>
    transaction.details.forEach((detail, detailIndex) => {
      detail.key =
        $p.parentViewModel.value?.transactions[transactionIndex]?.details[detailIndex]?.key ||
        uid();
    }),
  );

  return parentViewModel;
};
$p.modelChildrenGetter.value = (parentModel) => parentModel.transactions;
$p.viewModelChildrenGetter.value = (parentViewModel) => parentViewModel.transactions;
$p.selectNextChildAfterRemoving.value = (children) =>
  children.find((value) => value.statusHelper.statusName === 'cancelled') ||
  children[children.length - 1] ||
  (() => {
    throw new Error('[finance-invoices] - Index out of range');
  })();
$p.updateParentModel.value = async (payload) => {
  if (!$p.vmc.transactionHasSourceAccount($p.vm.value)) {
    $p.vm.value.sourceFinanceAccount = null;
  }

  if (!$p.vmc.transactionHasDestinationAccount($p.vm.value)) {
    $p.vm.value.destinationFinanceAccount = null;
  }

  payload.isViewModel &&
    ($p.pvm.value.transactions = sortBy($p.pvm.value.transactions, (value) =>
      date.extractDate(value.issueDate, editDateFormat),
    ));

  await store.updateDoc(payload);
};

// useTransactionEditPageExtra
$p.hasCustomer.value = true;

// useViewPageInvoiceExtra
$p.fillDetailsFromParent.value = $p.fillDetailsFromInvoice;

// usePageData - loadModel
void $p
  .loadModel((payload) => {
    payload.findKeyField = $p.parentModelFindKeyField.value;
    payload.findKey = $p.parentFindKey.value;
    return store.loadRealtimeDoc(payload);
  })
  .then(() => {
    $p.ready.value = true;
  });

// Lifecycle Hooks

onUnmounted(() => {
  $p.releaseModel.value && $p.releaseModel.value();
});

// Watch

watchEffect(() => {
  $p.hasEditor.value = !!$p.parentModel.value && !$p.parentModel.value.isArchived;

  $p.hasMultiViews.value = $p.hasDetails.value;

  $p.hasChildDeleting.value =
    hasRole('manager') &&
    !!$p.parentModel.value &&
    !$p.parentModel.value.isArchived &&
    !!$p.model.value &&
    $p.m.value.statusHelper.statusName === 'cancelled';
});

watchEffect(() => {
  $p.readonlyMode.value = !!$p.parentModel.value?.isArchived;
});

watch(
  () => $p.parentModel.value?.transactions.length,
  (value) => {
    if (value === 0) {
      delete meta.history;
      $p.backUrl.value = `/general-invoices/${$p.parentModel.value?.code.replaceAll('.', '_')}`;
    }
  },
);
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <div class="q-gutter-y-lg">
          <div class="text-center">
            <q-btn-toggle
              v-model="findKey"
              class="justify-center"
              :options="findKeyOptions"
              style="flex-wrap: wrap"
              toggle-color="primary"
            >
              <template v-for="option in findKeyOptions" :key="option.slot" #[option.slot]>
                <StatusIcon
                  class="q-mr-sm"
                  icon="fal fa-exchange"
                  :status="option.data.statusHelper"
                />
                {{ option.value }}
              </template>
            </q-btn-toggle>

            <div ref="childViewerRef"></div>
          </div>

          <FadeTransition>
            <TransactionViewer :key="m.code" :scope-name="SCOPE_NAME" />
          </FadeTransition>
        </div>
      </template>
      <template #editor>
        <FadeTransition>
          <TransactionEditor
            :key="m.code"
            :scope-name="SCOPE_NAME"
            :transaction-editor-main-component="TransactionEditorMain_Invoices"
          />
        </FadeTransition>
      </template>

      <template #toolbar-main>
        <q-btn
          v-show="showDeleteButton"
          key="deleteChild"
          :color="Dark.isActive ? 'grey-9' : 'grey-3'"
          :disable="freezed"
          icon="fal fa-trash-alt"
          :loading="deleting"
          round
          text-color="negative"
          @click="deleteChild"
        >
          <TopTooltip>Delete</TopTooltip>
        </q-btn>
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

        <q-btn
          v-show="showFillDetailsFromParentButton"
          key="fillDetailsFromParent"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          outline
          padding="sm"
          text-color="primary"
          @click="fillDetailsFromParent"
        >
          <FontAwesomeLayers class="fa-lg" fixed-width style="margin-left: 1px; margin-right: 1px">
            <FontAwesomeIcon :icon="['fal', 'list-ol']" size="lg" />
            <FontAwesomeIcon :icon="['fas', 'bolt']" size="lg" transform="shrink-10 up-8 left-9" />
          </FontAwesomeLayers>
          <TopTooltip>{{ fillDetailsFromParentButtonLabel }}</TopTooltip>
        </q-btn>
      </template>
    </ViewPage>
  </QPagePadding>
</template>
