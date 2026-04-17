<script setup lang="ts">
import type { Transaction } from 'models/finance/index.js';

import useProjectViewPage_ProjectExpenses from 'composables/finance/project/useProjectViewPage_ProjectExpenses.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  emc,
  f,
  m,
  readonlyMode,
  tmc,
  viewTransactionUrl,
} = useProjectViewPage_ProjectExpenses(props.scopeName);

// Data

const dumpTransactionList = [{ code: '_' } as Transaction];
</script>

<template>
  <ListTransition no-tag>
    <template v-if="m.expenses.length === 0">
      <!-- Smoothing enter animation -->
      <div key="smoothing"></div>

      <q-item v-if="!readonlyMode" key="addExpense" class="q-py-md">
        <div class="text-center full-width">
          <q-btn
            color="primary"
            label="Add Expense"
            :to="`/project-expenses/${m.urlFriendlyName}/new`"
          />
        </div>
      </q-item>
    </template>

    <q-expansion-item
      v-else
      key="expenses"
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      icon="fal fa-receipt"
      label="Expenses"
      popup
    >
      <q-card>
        <StickyHeaders dense markup-table separated target="#expensesViewerTable" />

        <q-markup-table id="expensesViewerTable" bordered dense>
          <thead>
            <tr>
              <th class="cell-separator" colspan="4">Expense</th>
              <th colspan="4">Transaction</th>
            </tr>
            <tr>
              <!-- Expense -->

              <th class="text-left">Code</th>
              <th class="text-left">Content</th>
              <th class="text-right">Total</th>
              <th class="cell-separator text-right">Balance</th>

              <!-- Transaction -->

              <th>Issue Date</th>
              <th class="text-left">Code</th>
              <th>Type</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            <template v-for="(expense, expenseIndex) in m.expenses">
              <tr
                v-for="(transaction, transactionIndex) in expense.transactions.length > 0
                  ? expense.transactions
                  : dumpTransactionList"
                :key="`${expense.code}_${transaction.code}`"
              >
                <!-- Expense -->

                <!-- Code -->
                <td
                  v-if="transactionIndex === 0"
                  class="vertical-top"
                  :class="{
                    'bottom-cell': expenseIndex === m.expenses.length - 1,
                  }"
                  :rowspan="expense.transactions.length || 1"
                >
                  <ObjectLink
                    color="primary"
                    :label="expense.code"
                    :to="`/project-expenses/${
                      m.urlFriendlyName
                    }/${expense.code.replaceAll('.', '_')}`"
                  >
                    <template #icon>
                      <StatusIcon
                        class="q-mr-sm"
                        icon="fal fa-receipt"
                        :status="expense.statusHelper"
                      />
                    </template>
                  </ObjectLink>
                </td>

                <!-- Content -->
                <td
                  v-if="transactionIndex === 0"
                  class="vertical-top text-wrap"
                  :class="{
                    'bottom-cell': expenseIndex === m.expenses.length - 1,
                  }"
                  :rowspan="expense.transactions.length || 1"
                >
                  {{ expense.content }}
                </td>

                <!-- Total -->
                <td
                  v-if="transactionIndex === 0"
                  class="vertical-top text-right"
                  :class="{
                    'bottom-cell': expenseIndex === m.expenses.length - 1,
                  }"
                  :rowspan="expense.transactions.length || 1"
                >
                  {{ f.currency(emc.expenseTotal(expense)) }}
                </td>

                <!-- Balance -->
                <td
                  v-if="transactionIndex === 0"
                  class="vertical-top text-right cell-separator"
                  :class="{
                    'bottom-cell': expenseIndex === m.expenses.length - 1,
                  }"
                  :rowspan="expense.transactions.length || 1"
                >
                  {{ f.currency(emc.expenseBalance(expense)) }}
                </td>

                <!-- Transaction -->

                <!-- Issue Date -->
                <!-- Code -->
                <!-- Type -->
                <!-- Total -->
                <td v-if="expense.transactions.length === 0" colspan="4"></td>
                <template v-else>
                  <!-- Issue Date -->
                  <td class="vertical-top text-center">
                    {{ f.date(transaction.issueDate) }}
                  </td>

                  <!-- Code -->
                  <td class="vertical-top">
                    <ObjectLink
                      color="primary"
                      :label="transaction.code"
                      :to="`${viewTransactionUrl}/${transaction.code.replaceAll('.', '_')}`"
                    >
                      <template #icon>
                        <StatusIcon
                          class="q-mr-sm"
                          icon="fal fa-exchange"
                          :status="transaction.statusHelper"
                        />
                      </template>
                    </ObjectLink>
                  </td>

                  <!-- Type -->
                  <td class="vertical-top text-center">
                    {{ transaction.type }}
                  </td>

                  <!-- Total -->
                  <td class="vertical-top text-right">
                    {{
                      f.currency(
                        tmc.transactionTotal(transaction) *
                          (tmc.transactionNegative(transaction) ? -1 : 1),
                      )
                    }}
                  </td>
                </template>
              </tr>
            </template>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-expansion-item>
  </ListTransition>
</template>

<style lang="scss" scoped>
.cell-separator {
  border-right: 1px solid $table-border-color;
}

.q-table--dark .cell-separator {
  border-right-color: $table-dark-border-color;
}

.bottom-cell {
  border-bottom: 0px;
}
</style>
