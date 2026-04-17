<script setup lang="ts">
import { computed } from 'vue';

import type { SalesContract, SalesContractVm } from 'models/finance/index.js';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  editMode,
  f,
  m,
  sameGeneralInvoiceSalesContracts,
  sameProjectSalesContracts,
  vm,
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
  <!-- Total -->
  <tr>
    <!-- Number -->
    <!-- Project -->
    <!-- Invoice -->
    <!-- Ref. Number -->
    <td colspan="4">
      <strong>Total</strong>
    </td>

    <!-- Subtotal -->
    <td class="text-right">
      <strong>{{ f.currency(mcOrVmc.salesContractInvoicesSubtotal(mOrVm)) }}</strong>
    </td>

    <!-- VAT -->
    <td class="text-right">
      <strong>{{ f.currency(mcOrVmc.salesContractInvoicesVat(mOrVm)) }}</strong>
    </td>

    <!-- Total -->
    <td class="text-right">
      <strong>{{ f.currency(mcOrVmc.salesContractInvoicesTotal(mOrVm)) }}</strong>
    </td>

    <!-- Buttons -->
    <td v-if="editMode"></td>
  </tr>

  <!-- Contact -->
  <tr
    v-if="sameProjectSalesContracts.length === 0 && sameGeneralInvoiceSalesContracts.length === 0"
  >
    <!-- Number -->
    <!-- Project -->
    <!-- Invoice -->
    <!-- Ref. Number -->
    <td colspan="4">Contract</td>

    <!-- Subtotal -->
    <td class="text-right">
      <div>
        {{ f.currency(mOrVm.subTotal) }}
      </div>
      <div v-if="editMode ? f.isNumber(vm.arising) : m.arising !== undefined" class="text-caption">
        {{ f.currency(mOrVm.arising) }}
        <TopTooltip>Arising</TopTooltip>
      </div>
    </td>

    <!-- VAT -->
    <td>
      <div
        v-if="editMode ? f.isNumber(vm.vatPercent) : m.vatPercent !== undefined"
        class="row justify-between no-wrap q-gutter-x-xs"
      >
        <span class="text-no-wrap"
          >({{ f.percent(mOrVm.vatPercent)
          }}{{
            (editMode ? f.isNumber(vm.secondVatPercent) : m.secondVatPercent !== undefined)
              ? `, ${f.percent(mOrVm.secondVatPercent)}`
              : ''
          }}{{
            (editMode ? f.isNumber(vm.vatAdjustment) : m.vatAdjustment !== undefined)
              ? `, ${mOrVm.vatAdjustment > 0 ? '+' : ''}${f.currency(mOrVm.vatAdjustment)}`
              : ''
          }})</span
        >
        {{ f.currency(mcOrVmc.salesContractVat(mOrVm)) }}
      </div>
    </td>

    <!-- Total -->
    <td class="text-right">
      {{ f.currency(mcOrVmc.salesContractTotal(mOrVm)) }}
    </td>

    <!-- Buttons -->
    <td v-if="editMode"></td>
  </tr>

  <!-- Same Invoice Sales Contracts -->
  <tr v-else>
    <!-- Number -->
    <!-- Project -->
    <!-- Invoice -->
    <!-- Ref. Number -->
    <td colspan="4">Contracts</td>

    <!-- Subtotal -->
    <td class="text-right">
      <div>
        {{
          f.currency(
            mcOrVmc.sameInvoiceSalesContractsSubtotal(mOrVm, [
              ...sameProjectSalesContracts,
              ...sameGeneralInvoiceSalesContracts,
            ]),
          )
        }}
      </div>
      <div class="text-caption">
        {{
          f.currency(
            mcOrVmc.sameInvoiceSalesContractsArising(mOrVm, [
              ...sameProjectSalesContracts,
              ...sameGeneralInvoiceSalesContracts,
            ]),
          )
        }}
        <TopTooltip>Arising</TopTooltip>
      </div>
    </td>

    <!-- VAT -->
    <td class="text-right">
      {{
        f.currency(
          mcOrVmc.sameInvoiceSalesContractsVat(mOrVm, [
            ...sameProjectSalesContracts,
            ...sameGeneralInvoiceSalesContracts,
          ]),
        )
      }}
    </td>

    <!-- Total -->
    <td class="text-right">
      {{
        f.currency(
          mcOrVmc.sameInvoiceSalesContractsTotal(mOrVm, [
            ...sameProjectSalesContracts,
            ...sameGeneralInvoiceSalesContracts,
          ]),
        )
      }}
    </td>

    <!-- Buttons -->
    <td v-if="editMode"></td>
  </tr>

  <!-- Difference -->
  <tr>
    <!-- Number -->
    <!-- Project -->
    <!-- Invoice -->
    <!-- Ref. Number -->
    <td colspan="4">
      <strong>Difference</strong>
    </td>

    <!-- Subtotal -->
    <td class="text-right">
      <strong>{{
        f.currency(
          mcOrVmc.salesContractSubtotalDifference(mOrVm, [
            ...sameProjectSalesContracts,
            ...sameGeneralInvoiceSalesContracts,
          ]),
        )
      }}</strong>
    </td>

    <!-- VAT -->
    <td class="text-right">
      <strong>{{
        f.currency(
          mcOrVmc.salesContractVatDifference(mOrVm, [
            ...sameProjectSalesContracts,
            ...sameGeneralInvoiceSalesContracts,
          ]),
        )
      }}</strong>
    </td>

    <!-- Total -->
    <td class="text-right">
      <strong>{{
        f.currency(
          mcOrVmc.salesContractDifference(mOrVm, [
            ...sameProjectSalesContracts,
            ...sameGeneralInvoiceSalesContracts,
          ]),
        )
      }}</strong>
    </td>

    <!-- Buttons -->
    <td v-if="editMode"></td>
  </tr>
</template>
