<script setup lang="ts">
import { nextTick } from 'vue';

import { date } from 'quasar';

import SalesContractStatus from 'utils/finance/SalesContract/SalesContractStatus.js';

import type { SalesContractVm } from 'models/finance/index.js';

import { useSalesContractsStore } from 'stores/finance/SalesContracts.js';

import { useSalesContractNewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import SalesContractEditor from 'components/SalesContract/SalesContractEditor.vue';

// Constants

const SCOPE_NAME = 'sales-contracts-new-page';

// Private

function initialModel(): SalesContractVm {
  class StatusClass extends SalesContractStatus<SalesContractVm> {}

  return StatusClass.newContainer(
    StatusClass,
    {
      id: '_',
      isArchived: false,
      code: '',
      urlFriendlyCode: '',
      signDate: date.formatDate(new Date(), editDateFormat),
      isCancelled: false,
      content: '',
      subTotal: '',
      arising: '',
      vatPercent: '',
      secondVatPercent: '',
      secondVatableAmount: '',
      vatAdjustment: '',
      notes: '',
      projects: [],
      generalInvoices: [],
      vatInvoices: [],
      firstVatInvoiceIssueDate: null,
      vatInvoiceIssueDateLength: null,
    },
    [],
  );
}

// Composables

const store = useSalesContractsStore();

const { editDateFormat } = requiredConfigEntries('editDateFormat');

const $p = useSalesContractNewPage(SCOPE_NAME, true);

// Private Executions

// usePageStatus
void nextTick(() => {
  $p.ready.value = true;
});

// usePageData
$p.viewModel.value = initialModel();
$p.createModel.value = (payload) => store.createDoc(payload);

// useEditor
$p.viewUrl.value = './';
$p.modelFindKeyField.value = 'urlFriendlyCode';

// useNavigateToListPage
$p.backUrl.value = '../sales-contracts';
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <SalesContractEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
