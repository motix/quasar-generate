<script setup lang="ts">
import { onUnmounted, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { Dark, uid } from 'quasar';

import type { Project, ProjectVm } from 'models/finance/index.js';

import { useProjectsStore } from 'stores/finance/Projects.js';

import { useExpenseViewPage } from 'composables/finance/expense/useExpenseEditPage.js';
import { projectExpenseEditPageComponentStore } from 'composables/finance/expense/useExpenseEditPage_ProjectExpenses.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import AddTransactionToolbarButton from 'components/Expense/AddTransactionToolbarButton.vue';
import ExpenseEditor from 'components/Expense/ExpenseEditor.vue';
import ExpenseEditorMain_ProjectExpenses from 'components/Expense/ExpenseEditorMain_ProjectExpenses.vue';
import ExpenseViewer_ProjectExpenses from 'components/Expense/ExpenseViewer_ProjectExpenses.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Constants

const SCOPE_NAME = 'project-expenses-view-page';

// Composables

const { meta } = useRoute();
const store = useProjectsStore();

const { hasRole, roles } = useFirebaseAuth();

const $p = useExpenseViewPage<true, Project, ProjectVm>(SCOPE_NAME, true, true);
const {
  // Auto sort
  addDetail,
  childViewerRef,
  deleteChild,
  deleting,
  findKey,
  findKeyOptions,
  freezed,
  m,
  showAddDetailButton,
  showDeleteButton,
} = $p;

// Private Executions

// useReturnUrl
$p.backUrl.value = '/project-expenses';

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
$p.viewUrl.value = '/project-expenses/';
$p.parentModelGetter.value = (docKey) => {
  const parentModel = store.doc(docKey);

  parentModel.expenses.forEach((value) => value.statusHelper.setUserRoles(roles.value));

  return parentModel;
};
$p.parentViewModelGetter.value = (docKey) => {
  const parentViewModel = store.docVm(docKey);

  parentViewModel.expenses.forEach((expense, expenseIndex) => {
    expense.details.forEach((detail, detailIndex) => {
      detail.key =
        $p.parentViewModel.value?.expenses[expenseIndex]?.details[detailIndex]?.key || uid();
    });
  });

  return parentViewModel;
};
$p.modelChildrenGetter.value = (parentModel) => parentModel.expenses;
$p.viewModelChildrenGetter.value = (parentViewModel) => parentViewModel.expenses;
$p.selectNextChildAfterRemoving.value = (children) =>
  children.find((value) => value.statusHelper.statusName === 'cancelled') ||
  children[children.length - 1] ||
  (() => {
    throw new Error('[finance-project-expenses] - Index out of range');
  })();
$p.updateParentModel.value = async (payload) => {
  await $p.modelBeforeUpdate(payload);
  await store.updateDoc(payload);
};

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

  $p.hasMultiViews.value = $p.anyCollectionHasItems.value;

  $p.hasChildDeleting.value =
    hasRole('manager') &&
    !!$p.parentModel.value &&
    !$p.parentModel.value.isArchived &&
    !!$p.model.value &&
    $p.m.value.statusHelper.statusName === 'cancelled' &&
    $p.m.value.transactions.every((value) => value.statusHelper.statusName === 'cancelled');
});

watchEffect(() => {
  $p.readonlyMode.value = !!$p.parentModel.value?.isArchived;
});

watch(
  () => $p.parentModel.value?.expenses.length,
  (value) => {
    if (value === 0) {
      delete meta.history;
      $p.backUrl.value = `/projects/${$p.parentModel.value?.urlFriendlyName}`;
    }
  },
);

$p.watchParentFindKey();
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
                  icon="fal fa-receipt"
                  :status="option.data.statusHelper"
                />
                {{ option.value }}
              </template>
            </q-btn-toggle>

            <div ref="childViewerRef"></div>
          </div>

          <FadeTransition>
            <component
              :is="
                projectExpenseEditPageComponentStore.projectExpenseViewer ||
                ExpenseViewer_ProjectExpenses
              "
              :key="m.code"
              :scope-name="SCOPE_NAME"
            />
          </FadeTransition>
        </div>
      </template>
      <template #editor>
        <FadeTransition>
          <ExpenseEditor
            :key="m.code"
            :expense-editor-main-component="
              projectExpenseEditPageComponentStore.projectExpenseEditorMain ||
              ExpenseEditorMain_ProjectExpenses
            "
            :scope-name="SCOPE_NAME"
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

        <AddTransactionToolbarButton :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
