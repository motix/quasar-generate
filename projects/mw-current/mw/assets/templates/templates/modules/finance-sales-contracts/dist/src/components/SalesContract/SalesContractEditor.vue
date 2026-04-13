<script setup lang="ts">
import { useTemplateRef } from 'vue';

import useSalesContractEditPage from 'composables/finance/sales-contract/useSalesContractEditPage.js';
import useMultiViews from 'composables/useMultiViews.js';

import ContractsCards from './cards/ContractsCards.vue';
import InvoicesEditorCards from './cards/InvoicesEditorCards.vue';
import VatInvoicesEditorCards from './cards/VatInvoicesEditorCards.vue';
import SalesContractEditorMain from './SalesContractEditorMain.vue';
import ContractsTable from './table/ContractsTable.vue';
import InvoicesEditorTable from './table/InvoicesEditorTable.vue';
import VatInvoicesEditorTable from './table/VatInvoicesEditorTable.vue';

// Private

async function validateSalesContractEditor() {
  !salesContractEditorMainRef.value &&
    (() => {
      throw new Error('salesContractEditorMainRef not specified');
    })();

  const validations = [salesContractEditorMainRef.value.validate()];

  if (!$p.isNewPage($p) && vm.value.vatInvoices.length > 0) {
    validations.push($p.validateVatInvoicesEditor());
  }

  const results = await Promise.all(validations);

  return !results.includes(false);
}

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { isTableView, isCardsView } = useMultiViews();

const $p = useSalesContractEditPage(props.scopeName);
const {
  // Auto sort
  vm,
} = $p;

// Data

const salesContractEditorMainRef = useTemplateRef('salesContractEditorMain');

// Private Executions

$p.useCustomValidation(validateSalesContractEditor);
</script>

<template>
  <div class="q-gutter-y-lg">
    <SalesContractEditorMain
      ref="salesContractEditorMain"
      :new-page="$p.isNewPage($p)"
      :scope-name="scopeName"
    />

    <FadeTransition v-if="!$p.isNewPage($p)">
      <div v-if="isTableView" key="tableView">
        <q-list class="rounded-list">
          <!-- Same Project Sales Contracts -->

          <ListTransition no-tag>
            <ContractsTable
              v-if="$p.sameProjectSalesContracts.value.length > 0"
              key="sameProjectSalesContracts"
              :contracts="$p.sameProjectSalesContracts.value"
              label="Same Project Sales Contracts"
              :scope-name="scopeName"
            />

            <!-- Same General Invoice Sales Contracts -->

            <ContractsTable
              v-if="$p.sameGeneralInvoiceSalesContracts.value.length > 0"
              key="sameGeneralInvoiceSalesContracts"
              :contracts="$p.sameGeneralInvoiceSalesContracts.value"
              label="Same General Invoice Sales Contracts"
              :scope-name="scopeName"
            />
          </ListTransition>

          <!-- Invoices -->

          <InvoicesEditorTable :scope-name="scopeName" />

          <!-- VAT Invoices -->

          <FadeTransition>
            <q-item v-if="vm.vatInvoices.length === 0" key="addVatInvoice" class="q-py-md">
              <div class="text-center full-width">
                <q-btn color="primary" label="Add VAT Invoice" @click="$p.addVatInvoice" />
              </div>
            </q-item>

            <VatInvoicesEditorTable v-else key="vatInvoices" :scope-name="scopeName" />
          </FadeTransition>
        </q-list>
      </div>

      <div v-else-if="isCardsView" key="cardsView" class="q-gutter-y-lg q-mt-none">
        <ListTransition :gutter="16" no-tag>
          <!-- Same Project Sales Contracts -->

          <ContractsCards
            v-if="$p.sameProjectSalesContracts.value.length > 0"
            key="sameProjectSalesContracts"
            :contracts="$p.sameProjectSalesContracts.value"
            label="Same Project Sales Contracts"
            :scope-name="scopeName"
          />

          <!-- Same General Invoice Sales Contracts -->

          <ContractsCards
            v-if="$p.sameGeneralInvoiceSalesContracts.value.length > 0"
            key="sameGeneralInvoiceSalesContracts"
            :contracts="$p.sameGeneralInvoiceSalesContracts.value"
            label="Same General Invoice Sales Contracts"
            :scope-name="scopeName"
          />
        </ListTransition>

        <!-- Invoices -->

        <InvoicesEditorCards :scope-name="scopeName" />

        <!-- VAT Invoices -->

        <FadeTransition>
          <div v-if="vm.vatInvoices.length === 0" key="addVatInvoice" class="text-center">
            <q-btn color="primary" label="Add VAT Invoice" @click="$p.addVatInvoice" />
          </div>

          <VatInvoicesEditorCards v-else key="vatInvoices" :scope-name="scopeName" />
        </FadeTransition>
      </div>
    </FadeTransition>
  </div>
</template>
