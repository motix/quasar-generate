<script setup lang="ts">
import { computed } from 'vue';

import type { SalesContract, SalesContractVm } from 'models/finance/index.js';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

import StickyHeaders from 'components/shared/StickyHeaders.vue';

import ContractEditorRow from './ContractEditorRow.vue';
import ContractViewerRow from './ContractViewerRow.vue';

// Props

const props = defineProps<{
  scopeName: string;
  label: string;
  contracts: SalesContract[];
}>();

// Composables

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  editMode,
  f,
  m,
} = $p;

// Computed

const mcOrVmc = computed(() => ($p.editMode.value ? $p.vmc : $p.mc));

const mOrVm = computed(
  () =>
    // Safely bypassing type checking
    $p.activeMOrVm.value as SalesContract & SalesContractVm,
);
</script>

<template>
  <q-expansion-item
    default-opened
    expand-icon-class="text-white"
    header-class="text-white text-h6 bg-accent"
    icon="fal fa-file-signature"
    :label="label"
    popup
  >
    <q-card>
      <StickyHeaders markup-table separated target="#contractsViewerTable" />

      <q-markup-table id="contractsViewerTable" bordered separator="cell" wrap-cells>
        <thead>
          <tr>
            <th class="q-table--col-auto-width">#</th>
            <th class="q-table--col-auto-width">Sign Date</th>
            <th>Code</th>
            <th>Content</th>
            <th>Subtotal</th>
            <th>Arising</th>
            <th>VAT</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          <ContractEditorRow v-if="editMode" :scope-name="scopeName" />

          <ContractViewerRow v-else :contract="m" :contract-index="0" :scope-name="scopeName" />

          <ContractViewerRow
            v-for="(contract, index) in contracts"
            :key="contract.id"
            :contract="contract"
            :contract-index="index + 1"
            :scope-name="scopeName"
          />

          <tr>
            <!-- Number -->
            <!-- Sign Date -->
            <!-- Code -->
            <!-- Content -->
            <td colspan="4">
              <strong>Total</strong>
            </td>

            <!-- Subtotal -->
            <td class="text-right">
              <strong>{{
                f.currency(mcOrVmc.sameInvoiceSalesContractsSubtotal(mOrVm, contracts))
              }}</strong>
            </td>

            <!-- Arising -->
            <td class="text-right">
              <strong>{{
                f.currency(mcOrVmc.sameInvoiceSalesContractsArising(mOrVm, contracts))
              }}</strong>
            </td>

            <!-- VAT -->
            <td class="text-right">
              <strong>{{
                f.currency(mcOrVmc.sameInvoiceSalesContractsVat(mOrVm, contracts))
              }}</strong>
            </td>

            <!-- Total -->
            <td class="text-right">
              <strong>{{
                f.currency(mcOrVmc.sameInvoiceSalesContractsTotal(mOrVm, contracts))
              }}</strong>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card>
  </q-expansion-item>
</template>
