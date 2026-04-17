<script setup lang="ts">
import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

import InvoiceCard from './InvoiceCard.vue';
import InvoicesSummaryCard from './InvoicesSummaryCard.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useSalesContractViewPage(props.scopeName);
const { invoices } = $p;
</script>

<template>
  <div class="q-gutter-y-md">
    <InvoicesSummaryCard :scope-name="scopeName" />

    <!-- Bottom padding to be consistent with editor -->
    <div class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs">
      <InvoiceCard
        v-for="(_, index) in invoices"
        :key="index"
        :invoice-index="index"
        :scope-name="scopeName"
      />
    </div>
  </div>
</template>
