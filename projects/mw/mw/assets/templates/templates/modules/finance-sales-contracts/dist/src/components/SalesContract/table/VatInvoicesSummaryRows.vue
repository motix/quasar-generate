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
  addVatInvoice,
  editMode,
  f,
  m,
  vm,
} = $p;

// Computed

const mcOrVmc = computed(() => ($p.editMode.value ? $p.vmc : $p.mc));

const mOrVm = computed(
  () =>
    // Safely bypassing type checking
    ($p.editMode.value ? $p.vm.value : $p.m.value) as SalesContract & SalesContractVm,
);
</script>

<template>
  <!-- Total -->
  <tr>
    <!-- Number -->
    <!-- Code -->
    <!-- Issue Date -->
    <!-- Cancelled -->
    <!-- Content -->
    <td colspan="5">
      <strong>Total</strong>
    </td>

    <!-- Subtotal -->
    <td class="text-right">
      <strong>{{ f.currency(mcOrVmc.salesContractVatInvoicesSubtotal(mOrVm)) }}</strong>
    </td>

    <!-- VAT -->
    <td class="text-right">
      <strong>{{ f.currency(mcOrVmc.salesContractVatInvoicesVat(mOrVm)) }}</strong>
    </td>

    <!-- Total -->
    <td class="text-right">
      <strong>{{ f.currency(mcOrVmc.salesContractVatInvoicesTotal(mOrVm)) }}</strong>
    </td>

    <!-- Buttons -->
    <td v-if="editMode">
      <q-btn color="primary" icon="fal fa-plus" outline padding="sm" @click="addVatInvoice()">
        <TopTooltip>Add VAT Invoice</TopTooltip>
      </q-btn>
    </td>
  </tr>

  <!-- Contact -->
  <tr>
    <!-- Number -->
    <!-- Code -->
    <!-- Issue Date -->
    <!-- Content -->
    <!-- Cancelled -->
    <td colspan="5">Contract</td>

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

  <!-- Balance -->
  <tr>
    <!-- Number -->
    <!-- Code -->
    <!-- Issue Date -->
    <!-- Content -->
    <!-- Cancelled -->
    <td colspan="5">
      <strong>Balance</strong>
    </td>

    <!-- Subtotal -->
    <td class="text-right">
      <strong>{{ f.currency(mcOrVmc.salesContractSubtotalBalance(mOrVm)) }}</strong>
    </td>

    <!-- VAT -->
    <td class="text-right">
      <strong>{{ f.currency(mcOrVmc.salesContractVatBalance(mOrVm)) }}</strong>
    </td>

    <!-- Total -->
    <td class="text-right">
      <strong>{{ f.currency(mcOrVmc.salesContractBalance(mOrVm)) }}</strong>
    </td>

    <!-- Buttons -->
    <td v-if="editMode"></td>
  </tr>
</template>
