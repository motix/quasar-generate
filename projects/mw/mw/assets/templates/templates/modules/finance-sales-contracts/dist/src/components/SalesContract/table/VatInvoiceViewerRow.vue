<script setup lang="ts">
import { computed } from 'vue';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

// Props

const props = defineProps<{
  scopeName: string;
  vatInvoiceIndex: number;
}>();

// Composables

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  f,
  mc,
} = $p;

// Computed

const vatInvoice = computed(
  () =>
    $p.m.value.vatInvoices[props.vatInvoiceIndex] ||
    (() => {
      throw new Error('[finance-sales-contracts] Index out of range');
    })(),
);
</script>

<template>
  <tr>
    <!-- Number -->
    <td class="text-right">
      {{ vatInvoiceIndex + 1 }}
    </td>

    <!-- Code -->
    <td class="text-center text-no-wrap">
      {{ vatInvoice.code }}
    </td>

    <!-- Issue Date -->
    <td class="text-center">
      {{ f.date(vatInvoice.issueDate) }}
    </td>

    <!-- Cancelled -->
    <td class="text-center">
      <q-toggle
        v-model="vatInvoice.isCancelled"
        checked-icon="fal fa-check"
        color="primary"
        disable
        unchecked-icon="clear"
      />
    </td>

    <!-- Content -->
    <td :class="{ 'text-muted': vatInvoice.isCancelled }">
      {{ vatInvoice.content }}
    </td>

    <!-- Subtotal -->
    <td class="text-right" :class="{ 'text-muted': vatInvoice.isCancelled }">
      {{ f.currency(vatInvoice.subTotal) }}
    </td>

    <!-- VAT -->
    <td :class="{ 'text-muted': vatInvoice.isCancelled }">
      <div
        v-if="vatInvoice.vatPercent !== undefined"
        class="row justify-between no-wrap q-gutter-x-xs"
      >
        <span
          >({{ f.percent(vatInvoice.vatPercent)
          }}{{
            vatInvoice.vatAdjustment !== undefined
              ? `, ${vatInvoice.vatAdjustment > 0 ? '+' : ''}${f.currency(
                  vatInvoice.vatAdjustment,
                )}`
              : ''
          }})</span
        >
        <span>{{ f.currency(mc.vatInvoiceVat(vatInvoice)) }}</span>
      </div>
    </td>

    <!-- Total -->
    <td class="text-right" :class="{ 'text-muted': vatInvoice.isCancelled }">
      {{ f.currency(mc.vatInvoiceTotal(vatInvoice)) }}
    </td>
  </tr>
</template>
