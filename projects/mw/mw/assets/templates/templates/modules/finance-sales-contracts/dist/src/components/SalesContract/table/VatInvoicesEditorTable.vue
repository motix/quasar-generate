<script setup lang="ts">
import type { ComponentPublicInstance, ShallowRef, useTemplateRef } from 'vue';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

import StickyHeaders from 'components/shared/StickyHeaders.vue';

import VatInvoiceEditorRow from './VatInvoiceEditorRow.vue';
import VatInvoicesSummaryRows from './VatInvoicesSummaryRows.vue';

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
    typeof useTemplateRef<InstanceType<typeof VatInvoiceEditorRow>>
  > extends Readonly<ShallowRef<infer Component>>
    ? Component
    : never;
}
</script>

<template>
  <q-expansion-item
    default-opened
    expand-icon-class="text-white"
    header-class="text-white text-h6 bg-accent"
    icon="fal fa-file-invoice-dollar"
    label="VAT Invoices"
    popup
  >
    <q-card>
      <StickyHeaders markup-table separated target="#vatInvoicesEditorTable" />

      <q-markup-table id="vatInvoicesEditorTable" bordered separator="cell" wrap-cells>
        <thead>
          <tr>
            <th class="q-table--col-auto-width">#</th>
            <th>Code</th>
            <th>Issue Date</th>
            <th>Cancelled</th>
            <th>Content</th>
            <th>Subtotal</th>
            <th>VAT</th>
            <th>Total</th>
            <th class="q-table--col-auto-width"></th>
          </tr>
        </thead>

        <tbody>
          <VatInvoiceEditorRow
            v-for="(vatInvoice, index) in vm.vatInvoices"
            :key="
              vatInvoice.key ||
              (() => {
                throw new Error('[finance-expense] VatInvoiceVm key not set');
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

          <VatInvoicesSummaryRows :scope-name="scopeName" />
        </tbody>
      </q-markup-table>
    </q-card>
  </q-expansion-item>
</template>
