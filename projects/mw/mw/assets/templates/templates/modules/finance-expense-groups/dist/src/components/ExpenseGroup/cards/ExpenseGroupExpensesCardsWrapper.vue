<script setup lang="ts">
import { Dark } from 'quasar';

import useExpenseGroupExpensesList from 'composables/finance/expense-group/useExpenseGroupExpensesList.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

// Props

const props = defineProps<{
  expenseGroupId: string;
  currentExpenseCode?: string;
  label?: string;
  loadingMessage?: string;
}>();

// Composables

const { cardWidth, listItemCardWidth } = requiredConfigEntries('cardWidth', 'listItemCardWidth');

const {
  // Auto sort
  emc,
  expenseRecords,
  expensesReady,
  f,
  onExpenseClick,
} = useExpenseGroupExpensesList(props);

// Expose

defineExpose({
  expenseRecords,
});
</script>

<template>
  <FadeTransition>
    <div v-if="!expenseRecords" key="loading">
      <FadeTransition>
        <div v-if="!expensesReady" class="text-center">
          {{ loadingMessage || 'Expenses loading' }}<br />
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </FadeTransition>
    </div>

    <div v-else-if="expenseRecords.length === 0" key="empty" class="text-center">
      There is no expense in this group.
    </div>

    <div v-else key="ready" class="q-gutter-y-md">
      <q-card
        class="q-mx-auto bg-accent"
        :class="Dark.isActive ? undefined : 'shadow-2'"
        dark
        style="width: 100%"
        :style="{ maxWidth: cardWidth + 'px' }"
      >
        <q-card-section>
          <div class="text-h6 text-center">{{ label || 'Expenses' }}</div>
        </q-card-section>
      </q-card>

      <!-- Bottom padding to be consistent with editor -->
      <div class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs">
        <ExpandableCard
          v-for="{ expense } in expenseRecords"
          :key="expense.id"
          body-class="q-col-gutter-sm row"
          :caption="f.date(expense.createDate) || undefined"
          caption-tooltip="Create Date"
          :clickable="expense.code !== currentExpenseCode"
          :external-link-url="`/general-expenses/${expense.code.replaceAll('.', '_')}`"
          header-separator
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="f.date(expense.issueDate) || undefined"
          subtitle-tooltip="Issue Date"
          :title="expense.code"
          @click="expense.code === currentExpenseCode ? undefined : onExpenseClick(expense)"
        >
          <template #main>
            <StatusBadge class="q-mt-sm" :status="expense.statusHelper" />
          </template>

          <template #side>
            <q-toggle
              v-model="expense.isArchived"
              checked-icon="fal fa-box-taped"
              class="right-toggle"
              color="primary"
              disable
              unchecked-icon="fal fa-box-open"
            >
              <TopTooltip>Archived</TopTooltip>
            </q-toggle>

            <q-item-label caption>
              {{ f.currency(emc.expenseTotal(expense)) }}
              <TopTooltip>Total</TopTooltip>
            </q-item-label>
            <q-item-label caption>
              <span class="text-muted">
                {{ f.currency(emc.expenseBalance(expense)) }}
              </span>
              <TopTooltip>Balance</TopTooltip>
            </q-item-label>
          </template>

          <template #body>
            <div class="col-6">
              <ObjectLink
                color="primary"
                icon="fal fa-user-crown"
                :label="
                  expense.supplier.name +
                  (expense.supplierExtraInfo ? ` (${expense.supplierExtraInfo})` : '')
                "
                :to="`/suppliers/${expense.supplier.code}`"
              />
            </div>

            <div class="col-12 text-body2">
              {{ expense.content }}
            </div>
          </template>

          <template v-if="expense.notes !== undefined" #bezel-less>
            <q-separator />

            <q-card-section
              class="text-caption text-italic"
              :class="{
                'bg-negative text-white': expense.notes?.startsWith('!'),
              }"
              style="border-bottom-left-radius: 4px; border-bottom-right-radius: 4px"
            >
              {{ expense.notes }}
            </q-card-section>
          </template>
        </ExpandableCard>
      </div>
    </div>
  </FadeTransition>
</template>
