<script setup lang="ts">
import useExpenseEditPage from 'composables/finance/expense/useExpenseEditPage.js';
import useMultiViews from 'composables/useMultiViews.js';

import ExpenseDetailsEditorCards from 'components/Expense/cards/ExpenseDetailsEditorCards.vue';
import ExpenseDetailsViewerCards from 'components/Expense/cards/ExpenseDetailsViewerCards.vue';
import ExpenseDetailsEditorTable from 'components/Expense/table/ExpenseDetailsEditorTable.vue';
import ExpenseDetailsViewerTable from 'components/Expense/table/ExpenseDetailsViewerTable.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { isTableView, isCardsView } = useMultiViews();

const $p = useExpenseEditPage(props.scopeName);
const {
  // Auto sort
  vm,
} = $p;
</script>

<template>
  <template v-if="!$p.isNewPage($p)">
    <FadeTransition v-if="!$p.isCompleted.value">
      <div v-if="vm.details.length === 0" key="empty" class="text-center">
        <q-btn color="primary" label="Add Detail" @click="$p.addDetail" />
      </div>

      <ExpenseDetailsEditorTable v-else-if="isTableView" key="tableView" :scope-name="scopeName" />

      <ExpenseDetailsEditorCards v-else-if="isCardsView" key="cardsView" :scope-name="scopeName" />
    </FadeTransition>

    <FadeTransition v-else-if="vm.details.length > 0">
      <ExpenseDetailsViewerTable v-if="isTableView" key="tableView" :scope-name="scopeName" />

      <ExpenseDetailsViewerCards v-else-if="isCardsView" key="cardsView" :scope-name="scopeName" />
    </FadeTransition>
  </template>
</template>
