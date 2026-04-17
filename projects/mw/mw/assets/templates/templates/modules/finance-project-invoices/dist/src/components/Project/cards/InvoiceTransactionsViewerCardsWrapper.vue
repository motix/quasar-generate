<script setup lang="ts">
import type { Invoice } from 'models/finance/index.js';

import TransactionsViewerCards from 'components/Project/cards/TransactionsViewerCards.vue';

// Props

defineProps<{
  scopeName: string;
  invoice: Invoice;
}>();
</script>

<template>
  <q-card-section v-if="invoice.transactions.length === 0" class="text-caption">
    This invoice has no transaction.
  </q-card-section>

  <TransactionsViewerCards v-else :scope-name="scopeName" :transactions="invoice.transactions" />
</template>
