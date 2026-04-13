<script setup lang="ts">
import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

import StickyHeaders from 'components/shared/StickyHeaders.vue';

import InvoiceRow from './InvoiceRow.vue';
import InvoicesSummaryRows from './InvoicesSummaryRows.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  invoices,
} = $p;
</script>

<template>
  <q-expansion-item
    default-opened
    expand-icon-class="text-white"
    header-class="text-white text-h6 bg-accent"
    icon="fal fa-file-invoice-dollar"
    label="Projects / General Invoices"
    popup
  >
    <q-card>
      <StickyHeaders markup-table separated target="#invoicesViewerTable" />

      <q-markup-table id="invoicesViewerTable" bordered separator="cell" wrap-cells>
        <thead>
          <tr>
            <th class="q-table--col-auto-width">#</th>
            <th>Project</th>
            <th>Invoice</th>
            <th>Ref. Number</th>
            <th>Subtotal</th>
            <th>VAT</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          <InvoiceRow
            v-for="(_, index) in invoices"
            :key="index"
            :invoice-index="index"
            :scope-name="scopeName"
          />

          <InvoicesSummaryRows :scope-name="scopeName" />
        </tbody>
      </q-markup-table>
    </q-card>
  </q-expansion-item>
</template>
