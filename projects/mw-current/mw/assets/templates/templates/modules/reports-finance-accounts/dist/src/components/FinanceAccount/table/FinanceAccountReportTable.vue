<script setup lang="ts">
import {
  isFinanceAccountReportDetail,
  isGeneralExpenseTransactionReportDetail,
  isGeneralInvoiceTransactionReportDetail,
  isGeneralTransactionReportDetail,
  isProjectExpenseTransactionReportDetail,
  isProjectInvoiceTransactionReportDetail,
} from 'utils/reports/finance-accounts.js';

import type { FinanceAccountReport, FinanceAccountReportDetail } from 'models/reports/index.js';

import useFinanceAccountReportSummary from 'composables/reports/financeAccount/useFinanceAccountReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{
  reportTitle: string;
  content: FinanceAccountReport;
  balanceRecords: boolean;
  projectInvoiceTransactions: boolean;
  projectExpenseTransactions: boolean;
  generalInvoiceTransactions: boolean;
  generalExpenseTransactions: boolean;
  generalTransactions: boolean;
}>();

// Composables

const { financeUrl } = requiredConfigEntries('financeUrl');

const f = useFormats();

const { totalCredit, totalDebit } = useFinanceAccountReportSummary(props.content.details);

// Methods

function transactionLink(detail: FinanceAccountReportDetail) {
  return `${financeUrl}/${
    detail.project
      ? `project-transactions/${detail.project.urlFriendlyName}`
      : detail.invoice
        ? `general-invoice-transactions/${detail.invoice.code.replaceAll('.', '_')}`
        : detail.expense
          ? `general-expense-transactions/${detail.expense.code.replaceAll('.', '_')}`
          : 'general-transactions'
  }/${detail.transaction.code.replaceAll('.', '_')}`;
}

function balanceRecordCssClass(detailIndex: number) {
  const detail =
    props.content.detailsWithBalanceRecords[detailIndex] ||
    (() => {
      throw new Error('[reports-finance-accounts] Index out of range');
    })();

  return {
    'text-positive':
      (detailIndex === 0 && detail.balance === props.content.beginningBalance) ||
      (detailIndex > 0 &&
        detail.balance === props.content.detailsWithBalanceRecords[detailIndex - 1]!.balance),
    'text-negative':
      (detailIndex === 0 && detail.balance !== props.content.beginningBalance) ||
      (detailIndex > 0 &&
        detail.balance !== props.content.detailsWithBalanceRecords[detailIndex - 1]!.balance),
  };
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
              <th>Transaction</th>
              <th>Customer / Supplier / Internal Finance Account</th>
              <th>Project / Invoice / Expense</th>
              <th>Content</th>
              <th class="q-table--col-auto-width">Credit</th>
              <th class="q-table--col-auto-width">Debit</th>
              <th class="q-table--col-auto-width">Balance</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th class="text-left" colspan="6">Beginning</th>
              <th colspan="2"></th>
              <th class="text-right">
                {{ f.currency(content.beginningBalance) }}
              </th>
            </tr>

            <tr
              v-for="(detail, index) in content.detailsWithBalanceRecords"
              v-show="
                (projectInvoiceTransactions && isProjectInvoiceTransactionReportDetail(detail)) ||
                (projectExpenseTransactions && isProjectExpenseTransactionReportDetail(detail)) ||
                (generalInvoiceTransactions && isGeneralInvoiceTransactionReportDetail(detail)) ||
                (generalExpenseTransactions && isGeneralExpenseTransactionReportDetail(detail)) ||
                (generalTransactions && isGeneralTransactionReportDetail(detail)) ||
                (balanceRecords && !isFinanceAccountReportDetail(detail))
              "
              :key="
                isFinanceAccountReportDetail(detail) ? detail.transaction.id : detail.date.valueOf()
              "
            >
              <template v-if="isFinanceAccountReportDetail(detail)">
                <!-- Number -->
                <td class="text-right">
                  {{ content.details.indexOf(detail) + 1 }}
                </td>

                <!-- Issue Date -->
                <td class="text-center">
                  {{ f.date(detail.transaction.issueDate) }}
                </td>

                <!-- Transaction -->
                <td>
                  <ObjectLink
                    color="primary"
                    :href="transactionLink(detail)"
                    :label="detail.transaction.code"
                    target="_blank"
                  >
                    <template #icon>
                      <StatusIcon
                        class="q-mr-sm"
                        icon="fal fa-exchange"
                        :status="detail.transaction.statusHelper"
                      />
                    </template>
                  </ObjectLink>
                </td>

                <!-- Customer / Supplier / Internal Finance Account -->
                <td class="text-wrap">
                  <ObjectLink
                    v-if="!!detail.customer"
                    color="primary"
                    :href="`${financeUrl}/customers/${detail.customer.code}`"
                    icon="fal fa-user-crown"
                    :label="detail.customer.name"
                    target="_blank"
                    wrap-label
                  />

                  <ObjectLink
                    v-if="!!detail.supplier"
                    color="primary"
                    :href="`${financeUrl}/suppliers/${detail.supplier.code}`"
                    icon="fal fa-building"
                    :label="detail.supplier.name"
                    target="_blank"
                    wrap-label
                  />

                  <ObjectLink
                    v-if="!!detail.otherFinanceAccount"
                    color="primary"
                    :href="`${financeUrl}/finance-accounts/${detail.otherFinanceAccount.id}`"
                    icon="fal fa-piggy-bank"
                    :label="detail.otherFinanceAccount.name"
                    target="_blank"
                    wrap-label
                  />
                </td>

                <!-- Project / Invoice / Expense -->
                <td class="text-wrap">
                  <div v-if="detail.project">
                    <ObjectLink
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
                  </div>

                  <div v-if="detail.invoice">
                    <q-icon
                      v-if="detail.project"
                      class="text-caption text-muted"
                      name="fal fa-arrow-turn-down-right fa-fw"
                    />
                    <ObjectLink
                      color="primary"
                      :href="
                        detail.project
                          ? `${financeUrl}/project-invoices/${
                              detail.project.urlFriendlyName
                            }/${detail.invoice.code.replaceAll('.', '_')}`
                          : `${financeUrl}/general-invoices/${detail.invoice.code.replaceAll(
                              '.',
                              '_',
                            )}`
                      "
                      :label="detail.invoice.code"
                      target="_blank"
                    >
                      <template #icon>
                        <StatusIcon
                          class="q-mr-sm"
                          icon="fal fa-file-invoice-dollar"
                          :status="detail.invoice.statusHelper"
                        />
                      </template>
                    </ObjectLink>
                    <div v-if="!detail.project" class="text-caption">
                      {{ detail.invoice.content }}
                    </div>
                  </div>

                  <div v-if="detail.expense">
                    <q-icon
                      v-if="detail.project"
                      class="text-caption text-muted"
                      name="fal fa-arrow-turn-down-right fa-fw"
                    />
                    <ObjectLink
                      color="primary"
                      :href="
                        detail.project
                          ? `${financeUrl}/project-expenses/${
                              detail.project.urlFriendlyName
                            }/${detail.expense.code.replaceAll('.', '_')}`
                          : `${financeUrl}/general-expenses/${detail.expense.code.replaceAll(
                              '.',
                              '_',
                            )}`
                      "
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
                    <div v-if="!detail.project" class="text-caption">
                      {{ detail.expense.content }}
                    </div>
                  </div>
                </td>

                <!-- Content -->
                <td class="text-wrap">
                  {{ detail.transaction.content }}
                </td>

                <!-- Credit -->
                <td class="text-right">
                  {{ f.currency(detail.credit) }}
                </td>

                <!-- Debit -->
                <td class="text-right">
                  {{ f.currency(detail.debit) }}
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
              </template>

              <template v-else>
                <!-- Number -->
                <td></td>

                <!-- Issue Date -->
                <td class="text-center" :class="balanceRecordCssClass(index)">
                  <strong>
                    {{ f.date(detail.date) }}
                  </strong>
                </td>

                <!-- Transaction -->
                <!-- Customer / Supplier / Internal Finance Account -->
                <!-- Project / Invoice / Expense -->
                <!-- Content -->
                <!-- Credit -->
                <!-- Debit -->
                <td class="text-center" :class="balanceRecordCssClass(index)" colspan="6">
                  <strong>Balance Record</strong>
                </td>

                <!-- Balance -->
                <td class="text-right" :class="balanceRecordCssClass(index)">
                  <strong>
                    {{ f.currency(detail.balance) }}
                  </strong>
                </td>
              </template>
            </tr>

            <tr>
              <!-- Number -->
              <!-- Issue Date -->
              <!-- Transaction -->
              <!-- Customer / Supplier / Internal Finance Account -->
              <!-- Project / Invoice / Expense -->
              <!-- Content -->
              <th class="text-left" colspan="6">Total / Ending</th>

              <!-- Credit -->
              <th class="text-right">
                {{ f.currency(totalCredit) }}
              </th>

              <!-- Debit -->
              <th class="text-right">
                {{ f.currency(totalDebit) }}
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
