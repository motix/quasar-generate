<script setup lang="ts">
import { useExpenseViewPage } from 'composables/finance/expense/useExpenseEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useMultiViews from 'composables/useMultiViews.js';

import ExpenseDetailsViewerCards from 'components/Expense/cards/ExpenseDetailsViewerCards.vue';
import ExpenseTransactionsViewerCardsWrapper from 'components/Expense/cards/ExpenseTransactionsViewerCardsWrapper.vue';
import ExpenseViewerCardsCollections from 'components/Expense/cards/ExpenseViewerCardsCollections.vue';
import ExpenseDetailsViewerTable from 'components/Expense/table/ExpenseDetailsViewerTable.vue';
import ExpenseTransactionsViewerTableWrapper from 'components/Expense/table/ExpenseTransactionsViewerTableWrapper.vue';
import ExpenseViewerTableCollections from 'components/Expense/table/ExpenseViewerTableCollections.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth } = requiredConfigEntries('cardWidth');

const { isTableView, isCardsView } = useMultiViews();

const $p = useExpenseViewPage(props.scopeName);
const {
  // Auto sort
  addDetail,
  isCompleted,
  m,
  readonlyMode,
} = $p;
</script>

<template>
  <q-card
    v-if="m.notes !== undefined"
    class="q-mx-auto"
    style="width: 100%"
    :style="{ maxWidth: cardWidth + 'px' }"
  >
    <q-card-section
      class="text-caption text-italic"
      :class="{
        'bg-negative text-white': m.notes.startsWith('!'),
      }"
    >
      {{ m.notes }}
    </q-card-section>
  </q-card>

  <FadeTransition>
    <div v-if="isTableView" key="tableView">
      <q-list class="rounded-list">
        <!-- Details -->

        <ListTransition no-tag>
          <template v-if="m.details.length === 0">
            <!-- Smoothing enter animation -->
            <div key="smoothing"></div>

            <q-item v-if="!readonlyMode && !isCompleted" key="addDetail" class="q-py-md">
              <div class="text-center full-width">
                <q-btn color="primary" label="Add Detail" @click="addDetail" />
              </div>
            </q-item>
          </template>

          <ExpenseDetailsViewerTable v-else key="details" :scope-name="scopeName" />
        </ListTransition>

        <!-- Transactions -->

        <ExpenseTransactionsViewerTableWrapper :scope-name="scopeName" />

        <ExpenseViewerTableCollections :scope-name="scopeName" />
      </q-list>
    </div>

    <div v-else-if="isCardsView" key="cardsView" class="q-gutter-y-lg">
      <!-- Details -->

      <ListTransition :gutter="24" no-tag>
        <!-- Smoothing enter animation -->
        <div key="smoothing"></div>

        <template v-if="m.details.length === 0">
          <div v-if="!readonlyMode && !isCompleted" key="addDetail" class="text-center">
            <q-btn color="primary" label="Add Detail" @click="addDetail" />
          </div>
        </template>

        <ExpenseDetailsViewerCards v-else key="details" :scope-name="scopeName" />
      </ListTransition>

      <!-- Transactions -->

      <ExpenseTransactionsViewerCardsWrapper :scope-name="scopeName" />

      <ExpenseViewerCardsCollections :scope-name="scopeName" />
    </div>
  </FadeTransition>
</template>
