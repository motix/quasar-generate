<script setup lang="ts">
import { nextTick } from 'vue';

import { date } from 'quasar';

import { invoiceVmDefaultExtendedFields } from 'utils/finance/Invoice/InvoiceDefaultExtendedFields';
import InvoiceStatus from 'utils/finance/Invoice/InvoiceStatus.js';

import type { InvoiceVm } from 'models/finance/index.js';

import { useGeneralInvoicesStore } from 'stores/finance/GeneralInvoices.js';

import { useInvoiceNewPage } from 'composables/finance/invoice/useInvoiceEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import InvoiceEditor from 'components/Invoice/InvoiceEditor.vue';

// Constants

const SCOPE_NAME = 'general-invoices-new-page';

// Private

function initialModel(): InvoiceVm {
  const createDate = date.formatDate(new Date(), editDateFormat);

  class StatusClass extends InvoiceStatus<InvoiceVm> {}

  return StatusClass.newContainer(
    StatusClass,
    {
      isArchived: false,
      code: '',
      createDate,
      issueDate: createDate,
      isRequired: false,
      isCompleted: false,
      isApproved: false,
      isRejected: false,
      isSentToCustomer: false,
      isCancelled: false,
      isCapitalContribution: false,
      isExternal: false,
      customerExtraInfo: '',
      referenceNumber: '',
      content: '',
      discount: '',
      contractSubtotal: '',
      vatPercent: '',
      vatableAmount: '',
      secondVatPercent: '',
      secondVatableAmount: '',
      vatAdjustment: '',
      relocatedSubtotal: '',
      relocatedVat: '',
      notes: '',
      details: [],
      transactions: [],
      listKey: null,
      ...invoiceVmDefaultExtendedFields(),
    },
    [],
  );
}

// Composables

const store = useGeneralInvoicesStore();

const { editDateFormat } = requiredConfigEntries('editDateFormat');

const $p = useInvoiceNewPage(SCOPE_NAME, false, true);

// Private Executions

// usePageStatus
void nextTick(() => {
  $p.ready.value = true;
});

// usePageData
$p.viewModel.value = initialModel();
$p.createModel.value = async (payload) => {
  await $p.viewModelBeforeCreate(payload);
  return await store.createDoc(payload);
};

// useEditor
$p.viewUrl.value = './';
$p.modelFindKeyField.value = 'code';

// useNavigateToListPage
$p.backUrl.value = '../general-invoices';
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <InvoiceEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
