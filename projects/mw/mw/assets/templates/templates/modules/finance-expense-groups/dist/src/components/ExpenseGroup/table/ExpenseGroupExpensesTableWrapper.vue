<script setup lang="ts">
import useExpenseGroupExpensesList from 'composables/finance/expense-group/useExpenseGroupExpensesList.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{
  expenseGroupId: string;
  currentExpenseCode?: string;
  icon?: string;
  label?: string;
  loadingMessage?: string;
  defaultOpened?: boolean;
}>();

// Composables

const {
  // Auto sort
  emc,
  expenseRecords,
  expensesReady,
  f,
} = useExpenseGroupExpensesList(props);

// Expose

defineExpose({
  expenseRecords,
});
</script>

<template>
  <FadeTransition>
    <q-item v-if="!expenseRecords" key="loading" class="q-py-md">
      <FadeTransition>
        <div v-if="!expensesReady" class="text-center full-width">
          {{ loadingMessage || 'Expenses loading' }}<br />
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </FadeTransition>
    </q-item>

    <q-item v-else-if="expenseRecords.length === 0" key="empty" class="q-py-md">
      <div class="text-center full-width">There is no expense in this group.</div>
    </q-item>

    <q-expansion-item
      v-else
      key="ready"
      :default-opened="defaultOpened"
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      :icon="icon || 'fal fa-list-ol'"
      :label="label || 'Expenses'"
      popup
    >
      <q-card>
        <StickyHeaders dense markup-table separated target="#expensesViewerTable" />

        <q-markup-table id="expensesViewerTable" bordered dense wrap-cells>
          <thead>
            <tr>
              <th class="q-table--col-auto-width">
                Issue Date<br />
                <span class="text-caption">Create Date</span>
              </th>
              <th class="text-left">Code</th>
              <th class="text-left text-wrap">
                Content<br />
                <span class="text-caption text-italic">Notes</span>
              </th>
              <th class="text-wrap">
                Supplier<br />
                <span class="text-caption">Extra Info</span>
              </th>
              <th class="q-table--col-auto-width">Status</th>
              <th class="text-right">
                Total<br />
                <span class="text-caption">Balance</span>
              </th>
              <th class="q-table--col-auto-width">Archived</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="{ expense } in expenseRecords" :key="expense.id">
              <!-- Issue Date / Create Date -->
              <td class="text-center">
                <div>
                  {{ f.date(expense.issueDate) }}
                  <TopTooltip>Issue Date</TopTooltip>
                </div>
                <div class="text-caption">
                  {{ f.date(expense.createDate) }}
                  <TopTooltip>Create Date</TopTooltip>
                </div>
              </td>

              <!-- Code -->
              <td>
                <ObjectLink
                  :color="expense.code === currentExpenseCode ? undefined : 'primary'"
                  :label="expense.code"
                  :ripple="expense.code !== currentExpenseCode"
                  :to="
                    expense.code === currentExpenseCode
                      ? undefined
                      : `/general-expenses/${expense.code.replaceAll('.', '_')}`
                  "
                >
                  <template #icon>
                    <StatusIcon
                      class="q-mr-sm"
                      icon="fal fa-file-invoice-dollar"
                      :status="expense.statusHelper"
                    />
                  </template>
                </ObjectLink>
              </td>

              <!-- Content / Notes -->
              <td class="text-wrap">
                <div>
                  {{ expense.content }}
                </div>
                <div
                  v-if="expense.notes !== undefined"
                  class="text-caption text-italic q-mt-xs"
                  :class="{
                    'bg-negative text-white q-px-sm q-py-xs rounded-borders shadow-2':
                      expense.notes!.startsWith('!'),
                  }"
                >
                  {{ expense.notes }}
                </div>
              </td>

              <!-- Supplier / Extra Info -->
              <td class="text-center text-wrap">
                <div>
                  <ObjectLink
                    color="primary"
                    :label="expense.supplier.name"
                    :to="`/suppliers/${expense.supplier.code}`"
                    wrap-label
                  />
                </div>
                <div v-if="expense.supplierExtraInfo" class="text-caption">
                  {{ expense.supplierExtraInfo }}
                </div>
              </td>

              <!-- Status -->
              <q-td class="text-center">
                <StatusBadge :status="expense.statusHelper" />
              </q-td>

              <!-- Total / Balance -->
              <td class="text-right">
                <div>
                  {{ f.currency(emc.expenseTotal(expense)) }}
                  <TopTooltip>Total</TopTooltip>
                </div>
                <div class="text-caption">
                  {{ f.currency(emc.expenseBalance(expense)) }}
                  <TopTooltip>Balance</TopTooltip>
                </div>
              </td>

              <!-- Archived -->
              <td class="text-center">
                <q-toggle
                  v-model="expense.isArchived"
                  checked-icon="fal fa-box-taped"
                  color="primary"
                  disable
                  unchecked-icon="fal fa-box-open"
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-expansion-item>
  </FadeTransition>
</template>
