<script setup lang="ts">
import { Dark } from 'quasar';

import useProjectViewPage_ProjectExpenses from 'composables/finance/project/useProjectViewPage_ProjectExpenses.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import ExpenseTransactionsViewerCardsWrapper from 'components/Project/cards/ExpenseTransactionsViewerCardsWrapper.vue';
import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth, listItemCardWidth } = requiredConfigEntries('cardWidth', 'listItemCardWidth');

const {
  // Auto sort
  emc,
  f,
  m,
  onExpenseClick,
  readonlyMode,
} = useProjectViewPage_ProjectExpenses(props.scopeName);
</script>

<template>
  <ListTransition :gutter="24" no-tag>
    <!-- Smoothing enter animation -->
    <div key="smoothing"></div>

    <template v-if="m.expenses.length === 0">
      <div v-if="!readonlyMode" key="addExpense" class="text-center">
        <q-btn
          color="primary"
          label="Add Expense"
          :to="`/project-expenses/${m.urlFriendlyName}/new`"
        />
      </div>
    </template>

    <div v-else key="expenses" class="q-gutter-y-md">
      <q-card
        class="q-mx-auto bg-accent"
        :class="Dark.isActive ? undefined : 'shadow-2'"
        dark
        style="width: 100%"
        :style="{ maxWidth: cardWidth + 'px' }"
      >
        <q-card-section>
          <div class="text-h6 text-center">Expenses</div>
        </q-card-section>
      </q-card>

      <!-- Bottom padding to be consistent with editor -->
      <div class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs">
        <ExpandableCard
          v-for="expense in m.expenses"
          :key="expense.code"
          avatar-icon="fal fa-receipt"
          avatar-size=""
          avatar-top
          clickable
          :external-link-url="`/project-expenses/${
            m.urlFriendlyName
          }/${expense.code.replaceAll('.', '_')}`"
          header-background-color="primary"
          header-dark
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :title="expense.code"
          title-top
          @click="onExpenseClick(expense)"
        >
          <template #main>
            <StatusBadge class="q-mt-sm" revert-color :status="expense.statusHelper" />
          </template>

          <template #side>
            <q-item-label caption>
              {{ f.currency(emc.expenseTotal(expense)) }}
              <TopTooltip>Total</TopTooltip>
            </q-item-label>
            <q-item-label caption>
              {{ f.currency(emc.expenseBalance(expense)) }}
              <TopTooltip>Balance</TopTooltip>
            </q-item-label>
          </template>

          <template #bezel-less-top>
            <q-card-section class="text-body2">
              {{ expense.content }}
            </q-card-section>

            <q-separator />
          </template>

          <template #bezel-less>
            <ExpenseTransactionsViewerCardsWrapper :expense="expense" :scope-name="scopeName" />
          </template>
        </ExpandableCard>
      </div>
    </div>
  </ListTransition>
</template>
