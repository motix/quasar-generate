<script setup lang="ts">
import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

import VatInvoicesSummaryCard from './VatInvoicesSummaryCard.vue';
import VatInvoiceViewerCard from './VatInvoiceViewerCard.vue';

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
  <div class="q-gutter-y-md">
    <VatInvoicesSummaryCard :scope-name="scopeName" />

    <!-- Bottom padding to be consistent with editor -->
    <div class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs">
      <VatInvoiceViewerCard
        v-for="(_, index) in m.vatInvoices"
        :key="index"
        :scope-name="scopeName"
        :vat-invoice-index="index"
      />
    </div>
  </div>
</template>
