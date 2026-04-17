<script setup lang="ts">
import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

import StickyHeaders from 'components/shared/StickyHeaders.vue';

import VatInvoicesSummaryRows from './VatInvoicesSummaryRows.vue';
import VatInvoiceViewerRow from './VatInvoiceViewerRow.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  m,
} = $p;
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
      <StickyHeaders markup-table separated target="#vatInvoicesViewerTable" />

      <q-markup-table id="vatInvoicesViewerTable" bordered separator="cell" wrap-cells>
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
          </tr>
        </thead>

        <tbody>
          <VatInvoiceViewerRow
            v-for="(_, index) in m.vatInvoices"
            :key="index"
            :scope-name="scopeName"
            :vat-invoice-index="index"
          />

          <VatInvoicesSummaryRows :scope-name="scopeName" />
        </tbody>
      </q-markup-table>
    </q-card>
  </q-expansion-item>
</template>
