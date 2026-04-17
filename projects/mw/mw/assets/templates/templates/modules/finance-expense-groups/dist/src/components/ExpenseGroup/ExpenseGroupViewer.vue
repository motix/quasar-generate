<script setup lang="ts">
import { useTemplateRef, watchEffect } from 'vue';

import type { ExpenseGroup, ExpenseGroupVm } from 'models/finance/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useMultiViews from 'composables/useMultiViews.js';

import ExpenseGroupExpensesCardsWrapper from './cards/ExpenseGroupExpensesCardsWrapper.vue';
import ExpenseGroupExpensesTableWrapper from './table/ExpenseGroupExpensesTableWrapper.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { isTableView, isCardsView } = useMultiViews();

const $p = useViewPage<ExpenseGroup, ExpenseGroupVm>(props.scopeName);
const {
  // Auto sort
  freezed,
  m,
} = $p;

// Data

const expensesRef = useTemplateRef('expenses');

// Watch

watchEffect(() => {
  $p.hasMultiViews.value = (expensesRef.value?.expenseRecords?.length || 0) > 0;
});
</script>

<template>
  <div class="q-gutter-y-lg">
    <ExpandableCard
      avatar-icon="fal fa-layer-group"
      :caption="m.description"
      class="q-mx-auto"
      header-background-color="primary"
      header-dark
      :title="m.name"
    >
      <template #side>
        <q-toggle
          v-model="m.isActive"
          checked-icon="fal fa-power-off"
          class="right-toggle"
          color="white"
          :disable="freezed"
          icon-color="primary"
          label="Active"
          left-label
          unchecked-icon="clear"
        />
      </template>
    </ExpandableCard>

    <FadeTransition>
      <div v-if="isTableView" key="tableView">
        <q-list class="rounded-list">
          <ExpenseGroupExpensesTableWrapper
            ref="expenses"
            default-opened
            :expense-group-id="m.id"
          />
        </q-list>
      </div>

      <div v-else-if="isCardsView" key="cardsView" class="q-gutter-y-lg">
        <ExpenseGroupExpensesCardsWrapper ref="expenses" :expense-group-id="m.id" />
      </div>
    </FadeTransition>
  </div>
</template>
