<script setup lang="ts">
import type { Expense } from 'models/finance/index.js';

import TransactionsViewerCards from 'components/Project/cards/TransactionsViewerCards.vue';

// Props

defineProps<{
  scopeName: string;
  expense: Expense;
}>();
</script>

<template>
  <q-card-section v-if="expense.transactions.length === 0" class="text-caption">
    This expense has no transaction.
  </q-card-section>

  <TransactionsViewerCards v-else :scope-name="scopeName" :transactions="expense.transactions" />
</template>
