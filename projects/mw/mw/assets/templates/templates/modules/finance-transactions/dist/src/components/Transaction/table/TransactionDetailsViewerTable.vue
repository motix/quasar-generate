<script setup lang="ts">
import { useTransactionViewPage } from 'composables/finance/transaction/useTransactionEditPage.js';

import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useTransactionViewPage(props.scopeName);
const {
  // Auto sort
  f,
  m,
  mc,
} = $p;
</script>

<template>
  <q-list class="rounded-list">
    <q-expansion-item
      default-opened
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      icon="fal fa-list-ol"
      label="Details"
      popup
    >
      <q-card>
        <StickyHeaders markup-table separated target="#detailsViewerTable" />

        <q-markup-table id="detailsViewerTable" bordered separator="cell" wrap-cells>
          <thead>
            <tr>
              <th class="q-table--col-auto-width">#</th>
              <th>Content</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            <!-- Details -->
            <tr v-for="(detail, index) in m.details" :key="index">
              <!-- Number -->
              <td class="text-right">
                {{ index + 1 }}
              </td>

              <!-- Content -->
              <td>
                {{ detail.content }}
              </td>

              <!-- Quantity -->
              <td class="text-right">
                {{ detail.quantity }}
              </td>

              <!-- Unit Price -->
              <td class="text-right">
                {{ f.currency(detail.unitPrice) }}
              </td>

              <!-- Amount -->
              <td class="text-right">
                {{ f.currency(mc.transactionDetailAmount(detail)) }}
              </td>
            </tr>

            <!-- Total -->
            <tr>
              <!-- Number -->
              <!-- Content -->
              <td class="text-right" colspan="2">
                <strong>Total</strong>
              </td>

              <!-- Quantity -->
              <td class="text-right">
                <strong>{{ mc.transactionTotalQuantity(m) }}</strong>
              </td>

              <!-- Unit Price -->
              <td></td>

              <!-- Amount -->
              <td class="text-right">
                <strong>{{ f.currency(mc.transactionTotal(m)) }}</strong>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>
