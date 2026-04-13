<script setup lang="ts">
import type { ComponentPublicInstance, ShallowRef, useTemplateRef } from 'vue';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

import VatInvoiceEditorCard from './VatInvoiceEditorCard.vue';
import VatInvoicesSummaryCard from './VatInvoicesSummaryCard.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  setVatInvoiceEditorRef,
  vm,
} = $p;

// Methods

function elConvert(el: Element | ComponentPublicInstance | null) {
  return el as ReturnType<
    typeof useTemplateRef<InstanceType<typeof VatInvoiceEditorCard>>
  > extends Readonly<ShallowRef<infer Component>>
    ? Component
    : never;
}
</script>

<template>
  <div class="q-gutter-y-md">
    <VatInvoicesSummaryCard :scope-name="scopeName" />

    <ListTransition
      class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs"
      color-effect
      :gutter="16"
    >
      <VatInvoiceEditorCard
        v-for="(vatInvoice, index) in vm.vatInvoices"
        :key="
          vatInvoice.key ||
          (() => {
            throw new Error('[finance-sales-contracts] TransactionDetailVm key not set');
          })()
        "
        :ref="
          (el) => {
            setVatInvoiceEditorRef(elConvert(el), index);
          }
        "
        :scope-name="scopeName"
        :vat-invoice-index="index"
      />
    </ListTransition>
  </div>
</template>
