<script setup lang="ts">
// sort-imports-ignore

import { library } from '@fortawesome/fontawesome-svg-core';
import { faFileInvoiceDollar, faNotEqual } from '@fortawesome/pro-light-svg-icons';
import { faBolt, faEye, faEyeSlash } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

import { onUnmounted, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { Dark } from 'quasar';

import { useProjectsStore } from 'stores/finance/Projects.js';

import useExportQuotationToExcel from 'composables/finance/quotation/useExportQuotationToExcel.js';
import useQuotationViewPage from 'composables/finance/quotation/useQuotationViewPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import QuotationStatusIcon from 'components/Quotation/QuotationStatusIcon.vue';
import QuotationViewer from 'components/Quotation/QuotationViewer.vue';

// <% if (config.hasModule('finance-project-invoices')) { %>•+ finance-project-invoices
import GenerateInvoiceToolbarButton from 'components/Quotation/GenerateInvoiceToolbarButton.vue';
// •- /finance-project-invoices<% } else { %>•! finance-project-invoices absent<% } %>

// Constants

const SCOPE_NAME = 'quotations-view-page';

// Composables

const { meta } = useRoute();
const store = useProjectsStore();

const { hasRole, roles } = useFirebaseAuth();

const { exportQuotationToExcel } = useExportQuotationToExcel();

const $p = useQuotationViewPage(SCOPE_NAME, true);
const {
  // Auto sort
  childViewerRef,
  deleteChild,
  deleting,
  findKey,
  findKeyOptions,
  freezed,
  m,
  pm,
  showComparision,
  showDeleteButton,
  showExportToExcelButton,
  showPrintButton,
  showToggleComparisionButton,
} = $p;

// Private Executions

library.add(faFileInvoiceDollar, faBolt, faNotEqual, faEye, faEyeSlash);

// useReturnUrl
$p.backUrl.value = '/quotations';

// usePageFeatures
$p.hasEditor.value = false;
// Hide predefined trash button
$p.hasDeleting.value = false;
$p.hasMultiViews.value = true;

// usePageData
$p.modelFindKeyField.value = 'code';

// usePageTitle
$p.modelNameField.value = 'code';

// useToolbar
$p.toolbarPersistent.value = true;

// useViewChildPage
$p.parentModelFindKeyField.value = 'urlFriendlyName';
$p.viewUrl.value = '/quotations/';
$p.parentModelGetter.value = (docKey) => {
  const parentModel = store.doc(docKey);

  parentModel.quotations.forEach((value) => value.statusHelper.setUserRoles(roles.value));

  return parentModel;
};
$p.modelChildrenGetter.value = (parentModel) => parentModel.quotations;
$p.selectNextChildAfterRemoving.value = (children) =>
  children.find((value) => value.statusHelper.statusName === 'cancelled') ||
  children[children.length - 1] ||
  (() => {
    throw new Error('[finance-quotations] - Index out of range');
  })();
$p.updateParentModel.value = (payload) => store.updateDoc(payload);

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
  // <% if (config.hasModule('finance-project-invoices')) { %>•+ finance-project-invoices
  $p.hasChildDeleting.value =
    hasRole('manager') &&
    !!$p.parentModel.value &&
    !$p.parentModel.value.isArchived &&
    !!$p.model.value &&
    $p.m.value.statusHelper.statusName === 'cancelled' &&
    (!$p.m.value.invoice ||
      ($p.m.value.invoice.isCancelled &&
        $p.m.value.invoice.transactions.every(
          (value) => value.statusHelper.statusName === 'cancelled',
        )));
  // •- /finance-project-invoices<% } else { %>•+ finance-project-invoices absent
  $p.hasChildDeleting.value =
    hasRole('manager') &&
    !!$p.parentModel.value &&
    !$p.parentModel.value.isArchived &&
    !!$p.model.value &&
    $p.m.value.statusHelper.statusName === 'cancelled';
  // •! finance-project-invoices absent<% } %>
});

watchEffect(() => {
  $p.readonlyMode.value = !!$p.parentModel.value?.isArchived;
});

watch(
  () => $p.parentModel.value?.quotations.length,
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
                <QuotationStatusIcon class="q-mr-sm" :quotation="option.data" />

                {{ option.value }}
              </template>
            </q-btn-toggle>

            <div ref="childViewerRef"></div>
          </div>

          <FadeTransition>
            <QuotationViewer :key="m.code" :scope-name="SCOPE_NAME" />
          </FadeTransition>
        </div>
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
          v-show="showToggleComparisionButton"
          key="showComparision"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          outline
          padding="sm"
          text-color="primary"
          @click="showComparision = !showComparision"
        >
          <FontAwesomeLayers class="fa-lg" fixed-width style="margin-left: 1px; margin-right: 1px">
            <FontAwesomeIcon :icon="['fal', 'not-equal']" size="lg" />
            <FontAwesomeIcon
              fixed-width
              :icon="['fas', showComparision ? 'eye' : 'eye-slash']"
              size="lg"
              transform="shrink-10 up-8 left-9"
            />
          </FontAwesomeLayers>
          <TopTooltip>
            {{
              showComparision
                ? 'Comparision Showing (Click to Hide)'
                : 'Comparision Hidden (Click to Show)'
            }}
          </TopTooltip>
        </q-btn>

        <q-btn
          v-show="showPrintButton"
          key="print"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          icon="fal fa-print"
          outline
          padding="sm"
          target="_blank"
          text-color="primary"
          :to="`/quotations/${pm.urlFriendlyName}/${m.code.replaceAll('.', '_')}/print-quotation`"
        >
          <TopTooltip>Print</TopTooltip>
        </q-btn>

        <q-btn
          v-show="showExportToExcelButton"
          key="exportToExcel"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          icon="fal fa-file-excel"
          outline
          padding="sm"
          text-color="primary"
          @click="() => void exportQuotationToExcel(m, pm)"
        >
          <TopTooltip>Export to Excel</TopTooltip>
        </q-btn>

        <!-- <% if (config.hasModule('finance-project-invoices')) { %>•+ finance-project-invoices -->
        <GenerateInvoiceToolbarButton :scope-name="SCOPE_NAME" />
        <!-- •- /finance-project-invoices<% } else { %>•! finance-project-invoices absent<% } %> -->
      </template>
    </ViewPage>
  </QPagePadding>
</template>
