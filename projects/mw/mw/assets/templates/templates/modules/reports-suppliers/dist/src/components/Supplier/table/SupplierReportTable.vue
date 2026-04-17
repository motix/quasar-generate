<script setup lang="ts">
import {
  isBalancedExpenseReportDetail,
  isUnbalancedExpenseReportDetail,
} from 'utils/reports/suppliers.js';

import type { SupplierReport, SupplierReportDetail } from 'models/reports/index.js';

import useSupplierReportSummary from 'composables/reports/supplier/useSupplierReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{
  reportTitle: string;
  content: SupplierReport;
  balancedExpenses: boolean;
  unbalancedExpenses: boolean;
}>();

// Composables

const { financeUrl } = requiredConfigEntries('financeUrl');

const f = useFormats();

const { totalExpenseAmount, totalPaymentAmount } = useSupplierReportSummary(props.content.details);

// Methods

function documentLink(detail: SupplierReportDetail) {
  return `${financeUrl}/${
    detail.document === detail.expense
      ? detail.project
        ? `project-expenses/${detail.project.urlFriendlyName}`
        : 'general-expenses'
      : detail.project
        ? `project-transactions/${detail.project.urlFriendlyName}`
        : `general-expense-transactions/${detail.expense.code.replaceAll('.', '_')}`
  }/${detail.document.code.replaceAll('.', '_')}`;
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
              <th>Document</th>
              <th>Project</th>
              <th>Content</th>
              <th class="q-table--col-auto-width">Expense</th>
              <th class="q-table--col-auto-width">Payment</th>
              <th class="q-table--col-auto-width">Balance</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th class="text-left" colspan="5">Beginning</th>
              <th colspan="2"></th>
              <th class="text-right">
                {{ f.currency(content.beginningBalance) }}
              </th>
            </tr>

            <tr
              v-for="(detail, index) in content.details"
              v-show="
                (balancedExpenses && isBalancedExpenseReportDetail(detail)) ||
                (unbalancedExpenses && isUnbalancedExpenseReportDetail(detail))
              "
              :key="detail.document.id"
            >
              <!-- Number -->
              <td class="text-right">
                {{ index + 1 }}
              </td>

              <!-- Issue Date -->
              <td class="text-center">
                {{ f.date(detail.document.issueDate) }}
              </td>

              <!-- Document -->
              <td>
                <ObjectLink
                  color="primary"
                  :href="documentLink(detail)"
                  :label="detail.document.code"
                  target="_blank"
                >
                  <template #icon>
                    <StatusIcon
                      class="q-mr-sm"
                      :icon="
                        detail.document === detail.expense ? 'fal fa-receipt' : 'fal fa-exchange'
                      "
                      :status="detail.document.statusHelper"
                    />
                  </template>
                </ObjectLink>
              </td>

              <!-- Project -->
              <td class="text-wrap">
                <ObjectLink
                  v-if="detail.project"
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
              </td>

              <!-- Content -->
              <td class="text-wrap">
                {{ detail.document.content }}
              </td>

              <!-- Expense -->
              <td class="text-right">
                {{ f.currency(detail.expenseAmount) }}
              </td>

              <!-- Payment -->
              <td class="text-right">
                {{ f.currency(detail.paymentAmount) }}
              </td>

              <!-- Balance -->
              <td
                class="text-right"
                :class="{
                  'text-positive': detail.balanceIncreased,
                  'text-negative': detail.balanceDecreased,
                }"
              >
                <div style="height: 0">
                  <q-icon
                    v-if="detail.balanceIncreased"
                    name="fas fa-chevron-double-up"
                    size="8px"
                    style="top: -12px"
                  />
                  <q-icon
                    v-if="detail.balanceDecreased"
                    name="fas fa-chevron-double-down"
                    size="8px"
                    style="bottom: -10px"
                  />
                </div>
                {{ f.currency(detail.balance) }}
              </td>
            </tr>

            <tr>
              <!-- Number -->
              <!-- Issue Date -->
              <!-- Document -->
              <!-- Project -->
              <!-- Content -->
              <th class="text-left" colspan="5">Total / Ending</th>

              <!-- Expense -->
              <th class="text-right">
                {{ f.currency(totalExpenseAmount) }}
              </th>

              <!-- Payment -->
              <th class="text-right">
                {{ f.currency(totalPaymentAmount) }}
              </th>

              <!-- Balance -->
              <th class="text-right">
                {{ f.currency(content.endingBalance) }}
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
