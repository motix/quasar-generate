<script setup lang="ts">
import {
  isGeneralExpenseReportDetail,
  isProjectExpenseReportDetail,
} from 'utils/reports/expenses.js';

import type { ExpensesReport, ExpensesReportDetail } from 'models/reports/index.js';

import useExpensesReportSummary from 'composables/reports/expense/useExpensesReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{
  reportTitle: string;
  content: ExpensesReport;
  showProjectExpenses: boolean;
  showGeneralExpenses: boolean;
  selectedFinanceAccounts: { [index: string]: boolean };
  selectedExpenseGroups: { [index: string]: boolean };
}>();

// Composables

const { financeUrl } = requiredConfigEntries('financeUrl');

const f = useFormats();

const { totalExpense, totalPayment, totalBalance, totalPaymentByFinanceAccount } =
  useExpensesReportSummary(props.content.details, props.content.financeAccounts);

// Methods

function expenseLink(detail: ExpensesReportDetail) {
  return `${financeUrl}/${
    detail.project ? `project-expenses/${detail.project.urlFriendlyName}` : 'general-expenses'
  }/${detail.expense.code.replaceAll('.', '_')}`;
}
</script>

<template>
  <q-list class="rounded-list">
    <q-expansion-item
      default-opened
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      :label="reportTitle"
      popup
    >
      <q-card>
        <StickyHeaders markup-table separated target="#mainTable" />

        <q-markup-table id="mainTable" bordered separator="cell">
          <thead>
            <tr>
              <th class="q-table--col-auto-width">#</th>
              <th class="q-table--col-auto-width">Issue Date</th>
              <th>Expense</th>
              <th>
                <template v-if="showProjectExpenses && !showGeneralExpenses">Project</template>
                <template v-else-if="!showProjectExpenses && showGeneralExpenses">Content</template>
                <template v-else>Project<br />Content</template>
              </th>
              <th>Group</th>
              <th>Supplier</th>
              <th class="q-table--col-auto-width">Balance</th>
              <th
                v-for="financeAccount in content.financeAccounts"
                v-show="selectedFinanceAccounts[financeAccount.id]"
                :key="financeAccount.id"
                class="q-table--col-auto-width"
              >
                {{ financeAccount.name }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(detail, index) in content.details"
              v-show="
                ((showProjectExpenses && isProjectExpenseReportDetail(detail)) ||
                  (showGeneralExpenses && isGeneralExpenseReportDetail(detail))) &&
                (detail.expense.group
                  ? selectedExpenseGroups[detail.expense.group.id]
                  : selectedExpenseGroups[''])
              "
              :key="detail.expense.id"
            >
              <!-- Number -->
              <td class="text-right">
                {{ index + 1 }}
              </td>

              <!-- Issue Date -->
              <td class="text-center">
                {{ f.date(detail.expense.issueDate) }}
              </td>

              <!-- Expense -->
              <td>
                <ObjectLink
                  color="primary"
                  :href="expenseLink(detail)"
                  :label="detail.expense.code"
                  target="_blank"
                >
                  <template #icon>
                    <StatusIcon
                      class="q-mr-sm"
                      icon="fal fa-receipt"
                      :status="detail.expense.statusHelper"
                    />
                  </template>
                </ObjectLink>
              </td>

              <!-- Project / Content -->
              <td class="text-wrap">
                <ObjectLink
                  v-if="!!detail.project"
                  color="primary"
                  :href="`${financeUrl}/projects/${detail.project.urlFriendlyName}`"
                  :label="detail.project.name"
                  target="_blank"
                  wrap-label
                >
                  <template #icon>
                    <StatusIcon
                      class="q-mr-sm"
                      icon="fal fa-briefcase"
                      :status="detail.project.statusHelper"
                    />
                  </template>
                </ObjectLink>

                <div>
                  {{ detail.expense.content }}
                </div>
              </td>

              <!-- Group -->
              <td style="max-width: 150px">
                <ObjectLink
                  v-if="detail.expense.group"
                  color="primary"
                  :href="`${financeUrl}/expense-groups/${detail.expense.group.id}`"
                  icon="fal fa-layer-group"
                  :label="detail.expense.group.name"
                  target="_blank"
                />
              </td>

              <!-- Supplier -->
              <td style="max-width: 150px">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/suppliers/${detail.expense.supplier.code}`"
                  icon="fal fa-user-crown"
                  :label="detail.expense.supplier.name"
                  target="_blank"
                />
              </td>

              <!-- Balance -->
              <td>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>Total</div>
                  <div>
                    {{ f.currency(detail.total) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>Total Payment</div>
                  <div>
                    {{ f.currency(detail.totalPayment, true) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>
                    <strong>Balance</strong>
                  </div>
                  <div>
                    <strong>{{ f.currency(detail.balance) }}</strong>
                  </div>
                </div>
              </td>

              <!-- Finance Accounts -->
              <td
                v-for="financeAccount in content.financeAccounts"
                v-show="selectedFinanceAccounts[financeAccount.id]"
                :key="financeAccount.id"
                class="text-right"
              >
                {{ f.currency(detail.totalPaymentByFinanceAccount[financeAccount.id]) }}
              </td>
            </tr>

            <tr>
              <!-- Number -->
              <!-- Issue Date -->
              <!-- Expense -->
              <!-- Project / Content -->
              <!-- Group -->
              <!-- Supplier -->
              <th class="text-right" colspan="6">Total</th>

              <!-- Balance -->
              <td>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>Total</div>
                  <div>
                    {{ f.currency(totalExpense) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>Total Payment</div>
                  <div>
                    {{ f.currency(totalPayment, true) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>
                    <strong>Balance</strong>
                  </div>
                  <div>
                    <strong>{{ f.currency(totalBalance) }}</strong>
                  </div>
                </div>
              </td>

              <!-- Finance Accounts -->
              <th
                v-for="financeAccount in content.financeAccounts"
                v-show="selectedFinanceAccounts[financeAccount.id]"
                :key="financeAccount.id"
                class="text-right"
              >
                {{ f.currency(totalPaymentByFinanceAccount[financeAccount.id]) }}
              </th>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<style scoped lang="scss">
table {
  th,
  td {
    font-size: 0.85rem;
  }
}

tbody tr:first-child th {
  border-bottom: 1px solid $table-border-color;
}

.q-table--dark tbody tr:first-child th {
  border-bottom-color: $table-dark-border-color;
}

thead th {
  white-space: normal;
}
</style>
