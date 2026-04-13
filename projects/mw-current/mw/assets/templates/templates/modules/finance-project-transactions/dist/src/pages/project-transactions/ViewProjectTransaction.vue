<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { faListOl } from '@fortawesome/pro-light-svg-icons';
import { faBolt } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

import { onUnmounted, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { Dark, date, uid } from 'quasar';

import { sortBy } from 'lodash-es';

import type { Project, ProjectVm } from 'models/finance/index.js';

import { useProjectsStore } from 'stores/finance/Projects.js';

import { useTransactionViewPage } from 'composables/finance/transaction/useTransactionEditPage.js';
import { useTransactionViewPage_ProjectTransactions } from 'composables/finance/transaction/useTransactionEditPage_ProjectTransactions.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import TransactionEditor from 'components/Transaction/TransactionEditor.vue';
import TransactionEditorMain_ProjectTransactions from 'components/Transaction/TransactionEditorMain_ProjectTransactions.vue';
import TransactionViewer from 'components/Transaction/TransactionViewer_ProjectTransactions.vue';

// Constants

const SCOPE_NAME = 'project-transactions-view-page';

// Composables

const { meta } = useRoute();
const store = useProjectsStore();

const { editDateFormat } = requiredConfigEntries('editDateFormat');

const { hasRole, roles } = useFirebaseAuth();

useTransactionViewPage<true, Project, ProjectVm>(SCOPE_NAME, true, true);
const $p = useTransactionViewPage_ProjectTransactions(SCOPE_NAME);
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
  parentModel,
  showAddDetailButton,
  showDeleteButton,
  showFillDetailsFromParentButton,
} = $p;

// Private Executions

library.add(faListOl, faBolt);

// useReturnUrl
$p.backUrl.value = '/project-transactions';

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
$p.parentModelFindKeyField.value = 'urlFriendlyName';
$p.viewUrl.value = '/project-transactions/';
$p.parentModelGetter.value = (docKey) => {
  const parentModel = store.doc(docKey);

  parentModel.quotations
    .flatMap((value) => value.invoice?.transactions || [])
    .forEach((value) => value.statusHelper.setUserRoles(roles.value));

  parentModel.expenses
    .flatMap((value) => value.transactions)
    .forEach((value) => value.statusHelper.setUserRoles(roles.value));

  return parentModel;
};
$p.parentViewModelGetter.value = (docKey) => {
  const parentViewModel = store.docVm(docKey);

  parentViewModel.quotations.forEach((quotation, quotationIndex) =>
    quotation.invoice?.transactions.forEach((transaction, transactionIndex) =>
      transaction.details.forEach((detail, detailIndex) => {
        detail.key =
          $p.parentViewModel.value?.quotations[quotationIndex]?.invoice?.transactions[
            transactionIndex
          ]?.details[detailIndex]?.key || uid();
      }),
    ),
  );

  parentViewModel.expenses.forEach((expense, expenseIndex) =>
    expense.transactions.forEach((transaction, transactionIndex) =>
      transaction.details.forEach((detail, detailIndex) => {
        detail.key =
          $p.parentViewModel.value?.expenses[expenseIndex]?.transactions[transactionIndex]?.details[
            detailIndex
          ]?.key || uid();
      }),
    ),
  );

  return parentViewModel;
};
$p.modelChildrenGetter.value = (parentModel) => [
  ...parentModel.quotations.flatMap((value) => value.invoice?.transactions || []),
  ...parentModel.expenses.flatMap((value) => value.transactions),
];
$p.viewModelChildrenGetter.value = (parentViewModel) => [
  ...parentViewModel.quotations.flatMap((value) => value.invoice?.transactions || []),
  ...parentViewModel.expenses.flatMap((value) => value.transactions),
];
$p.removeChild.value = (child) => {
  const transactions =
    parentModel.value?.quotations.find((value) => value.invoice?.transactions.includes(child))
      ?.invoice?.transactions ||
    parentModel.value?.expenses.find((value) => value.transactions.includes(child))?.transactions ||
    [];

  if (transactions.length > 0) {
    transactions.splice(transactions.indexOf(child), 1);
  }
};
$p.selectNextChildAfterRemoving.value = (children) =>
  children.find((value) => value.statusHelper.statusName === 'cancelled') ||
  children[children.length - 1] ||
  (() => {
    throw new Error('[finance-project-transactions] - Index out of range');
  })();
$p.updateParentModel.value = async (payload) => {
  if (!$p.vmc.transactionHasSourceAccount($p.vm.value)) {
    $p.vm.value.sourceFinanceAccount = null;
  }

  if (!$p.vmc.transactionHasDestinationAccount($p.vm.value)) {
    $p.vm.value.destinationFinanceAccount = null;
  }

  if (payload.isViewModel) {
    if ($p.invoice.value && $p.quotation.value) {
      const invoiceVm = (
        $p.pvm.value.quotations[$p.pm.value.quotations.indexOf($p.quotation.value)] ||
        (() => {
          throw new Error('[finance-project-transactions] - Index out of range');
        })()
      ).invoice;

      invoiceVm &&
        (invoiceVm.transactions = sortBy(invoiceVm?.transactions, (value) =>
          date.extractDate(value.issueDate, editDateFormat),
        ));
    }

    if ($p.expense.value) {
      const expenseVm =
        $p.pvm.value.expenses[$p.pm.value.expenses.indexOf($p.expense.value)] ||
        (() => {
          throw new Error('[finance-project-transactions] - Index out of range');
        })();

      expenseVm.transactions = sortBy(expenseVm.transactions, (value) =>
        date.extractDate(value.issueDate, editDateFormat),
      );
    }
  }

  await store.updateDoc(payload);
};

// useTransactionEditPageExtra
$p.isForProject.value = true;

// useViewPageProjectExtra
$p.fillDetailsFromParent.value = $p.fillDEtailsFromProject;

// usePageData - loadModel
void $p
  .loadModel((payload) => {
    payload.findKeyField = $p.parentModelFindKeyField.value;
    payload.findKey = $p.parentFindKey.value;
    return store.loadRealtimeDoc(payload);
  })
  .then(() => ($p.ready.value = true));

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

watchEffect(() => {
  $p.hasCustomer.value =
    !!$p.parentModel.value &&
    $p.parentModel.value.quotations.some(
      (value) => $p.model.value && value.invoice?.transactions.includes($p.model.value),
    );

  $p.hasSupplier.value =
    !!$p.parentModel.value &&
    $p.parentModel.value.expenses.some(
      (value) => $p.model.value && value.transactions.includes($p.model.value),
    );
});

watch(
  () =>
    [
      ...($p.parentModel.value?.quotations || []).flatMap(
        (value) => value.invoice?.transactions || [],
      ),
      ...($p.parentModel.value?.expenses || []).flatMap((value) => value.transactions),
    ].length,
  (value) => {
    if (value === 0) {
      delete meta.history;
      $p.backUrl.value = `/projects/${$p.parentModel.value?.urlFriendlyName}`;
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
            :transaction-editor-main-component="TransactionEditorMain_ProjectTransactions"
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
