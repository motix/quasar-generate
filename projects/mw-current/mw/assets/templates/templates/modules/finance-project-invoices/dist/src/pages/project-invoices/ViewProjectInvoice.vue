<script setup lang="ts">
import { onUnmounted, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { Dark, uid } from 'quasar';

import type { Project, ProjectVm } from 'models/finance/index.js';

import { useProjectsStore } from 'stores/finance/Projects.js';

import { useInvoiceViewPage } from 'composables/finance/invoice/useInvoiceEditPage.js';
import { projectInvoiceEditPageComponentStore } from 'composables/finance/invoice/useInvoiceEditPage_ProjectInvoices.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import AddTransactionToolbarButton from 'components/Invoice/AddTransactionToolbarButton.vue';
import InvoiceEditor from 'components/Invoice/InvoiceEditor.vue';
import InvoiceEditorMain_ProjectInvoices from 'components/Invoice/InvoiceEditorMain_ProjectInvoices.vue';
import InvoiceViewer_ProjectInvoices from 'components/Invoice/InvoiceViewer_ProjectInvoices.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Constants

const SCOPE_NAME = 'project-invoices-view-page';

// Composables

const { meta } = useRoute();
const store = useProjectsStore();

const { hasRole, roles } = useFirebaseAuth();

const $p = useInvoiceViewPage<true, Project, ProjectVm>(SCOPE_NAME, true, true);
const {
  // Auto sort
  childViewerRef,
  deleteChild,
  deleting,
  findKey,
  findKeyOptions,
  freezed,
  m,
  showDeleteButton,
} = $p;

// Private Executions

// useReturnUrl
$p.backUrl.value = '/project-invoices';

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
$p.viewUrl.value = '/project-invoices/';
$p.parentModelGetter.value = (docKey) => {
  const parentModel = store.doc(docKey);

  parentModel.quotations.forEach((value) => value.invoice?.statusHelper.setUserRoles(roles.value));

  return parentModel;
};
$p.parentViewModelGetter.value = (docKey) => {
  const parentViewModel = store.docVm(docKey);

  parentViewModel.quotations.forEach((quotation, quotationIndex) =>
    quotation.invoice?.details.forEach((detail, detailIndex) => {
      detail.key =
        $p.parentViewModel.value?.quotations[quotationIndex]?.invoice?.details[detailIndex]?.key ||
        uid();
    }),
  );

  return parentViewModel;
};
$p.modelChildrenGetter.value = (parentModel) =>
  parentModel.quotations.flatMap((value) => (value.invoice ? [value.invoice] : []));
$p.viewModelChildrenGetter.value = (parentViewModel) =>
  parentViewModel.quotations.flatMap((value) => (value.invoice ? [value.invoice] : []));
$p.removeChild.value = (child) => {
  const quotation = $p.parentModel.value?.quotations.find((value) => value.invoice === child);

  if (quotation) {
    quotation.invoice = undefined; // Allow undefined while editing
  }
};
$p.selectNextChildAfterRemoving.value = (children) =>
  children.find((value) => value.statusHelper.statusName === 'cancelled') ||
  children[children.length - 1] ||
  (() => {
    throw new Error('[finance-project-invoices] - Index out of range');
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
  () =>
    $p.parentModel.value?.quotations.flatMap((value) => (value.invoice ? [value.invoice] : []))
      .length,
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
                  icon="fal fa-file-invoice-dollar"
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
                projectInvoiceEditPageComponentStore.projectInvoiceViewer ||
                InvoiceViewer_ProjectInvoices
              "
              :key="m.code"
              :scope-name="SCOPE_NAME"
            />
          </FadeTransition>
        </div>
      </template>
      <template #editor>
        <FadeTransition>
          <InvoiceEditor
            :key="m.code"
            :invoice-editor-main-component="
              projectInvoiceEditPageComponentStore.projectInvoiceEditorMain ||
              InvoiceEditorMain_ProjectInvoices
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
        <AddTransactionToolbarButton :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
