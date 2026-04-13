<script setup lang="ts">
import { computed, onUnmounted, watchEffect } from 'vue';

import { Dark, date, uid } from 'quasar';

import { useSalesContractsStore } from 'stores/finance/SalesContracts.js';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import SalesContractEditor from 'components/SalesContract/SalesContractEditor.vue';
import SalesContractViewer from 'components/SalesContract/SalesContractViewer.vue';

// Constants

const SCOPE_NAME = 'sales-contracts-view-page';

// Private

const isArchived = computed(() => $p.model.value?.isArchived);

// Composables

const { editDateFormat } = requiredConfigEntries('editDateFormat');

const store = useSalesContractsStore();

const { hasRole } = useFirebaseAuth();

const $p = useSalesContractViewPage(SCOPE_NAME, true);
const {
  // Auto sort
  addVatInvoice,
  showAddVatInvoiceButton,
} = $p;

// Private Executions

// useReturnUrl
$p.backUrl.value = '../sales-contracts';

// usePageData
$p.modelFindKeyField.value = 'urlFriendlyCode';
$p.modelGetter.value = (docKey) => store.doc(docKey);
$p.viewModelGetter.value = (docKey) => {
  const viewModel = store.docVm(docKey);

  viewModel.vatInvoices.forEach((vatInvoice, vatInvoiceIndex) => {
    vatInvoice.key = $p.viewModel.value?.vatInvoices[vatInvoiceIndex]?.key || uid();
  });

  return viewModel;
};
$p.updateModel.value = (payload) => {
  if (payload.isViewModel) {
    if (!$p.f.isNumber($p.vm.value.vatPercent)) {
      $p.vm.value.secondVatPercent = '';
      $p.vm.value.secondVatableAmount = '';
      $p.vm.value.vatAdjustment = '';
    }

    for (const vatInvoice of $p.vm.value.vatInvoices) {
      if (!$p.f.isNumber(vatInvoice.vatPercent)) {
        vatInvoice.vatAdjustment = '';
      }
    }

    const vatInvoiceIssueDates = $p.vm.value.vatInvoices.map((value) =>
      date.extractDate(value.issueDate, editDateFormat).valueOf(),
    );

    $p.vm.value.firstVatInvoiceIssueDate =
      vatInvoiceIssueDates.length === 0
        ? null
        : date.formatDate(new Date(Math.min(...vatInvoiceIssueDates)), editDateFormat);

    $p.vm.value.vatInvoiceIssueDateLength =
      vatInvoiceIssueDates.length === 0
        ? null
        : new Date(Math.max(...vatInvoiceIssueDates)).getFullYear() -
          new Date(Math.min(...vatInvoiceIssueDates)).getFullYear() +
          1;
  }

  return store.updateDoc(payload);
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

  $p.hasDeleting.value = hasRole('manager') && !!$p.model.value && !$p.model.value.isArchived;

  $p.hasMultiViews.value =
    $p.editMode.value ||
    (!!$p.model.value &&
      $p.model.value.projects.length +
        $p.model.value.generalInvoices.length +
        $p.model.value.vatInvoices.length +
        $p.sameProjectSalesContracts.value.length +
        $p.sameGeneralInvoiceSalesContracts.value.length >
        0);
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
        <SalesContractViewer :scope-name="SCOPE_NAME" />
      </template>
      <template #editor>
        <SalesContractEditor :scope-name="SCOPE_NAME" />
      </template>

      <template #toolbar-extra>
        <q-btn
          v-show="showAddVatInvoiceButton"
          key="addVatInvoice"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          icon="fal fa-plus"
          outline
          padding="sm"
          text-color="primary"
          @click="addVatInvoice"
        >
          <TopTooltip>Add VAT Invoice</TopTooltip>
        </q-btn>
      </template>
    </ViewPage>
  </QPagePadding>
</template>
