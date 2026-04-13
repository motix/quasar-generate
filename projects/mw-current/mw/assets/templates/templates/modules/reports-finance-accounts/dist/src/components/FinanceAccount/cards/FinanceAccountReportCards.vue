<script setup lang="ts">
import { Dark } from 'quasar';

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

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

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

const { cardWidth, listItemCardWidth, financeUrl } = requiredConfigEntries(
  'cardWidth',
  'listItemCardWidth',
  'financeUrl',
);

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
  <div>
    <div class="row items-start justify-evenly q-gutter-md">
      <q-card class="bg-accent" dark style="width: 100%" :style="{ maxWidth: cardWidth + 'px' }">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-center">
            {{ reportTitle }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row justify-between">
            <div>Beginning Balance</div>
            <div class="text-warning">
              {{ f.currency(content.beginningBalance) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total Credit</div>
            <div class="text-warning">
              {{ f.currency(totalCredit) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total Debit</div>
            <div class="text-warning">
              {{ f.currency(totalDebit) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Ending Balance</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(content.endingBalance) }}
              </strong>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="flex-break q-mt-none"></div>

      <template
        v-for="(detail, index) in content.detailsWithBalanceRecords"
        :key="isFinanceAccountReportDetail(detail) ? detail.transaction.id : detail.date.valueOf()"
      >
        <ExpandableCard
          v-if="isFinanceAccountReportDetail(detail)"
          v-show="
            (projectInvoiceTransactions && isProjectInvoiceTransactionReportDetail(detail)) ||
            (projectExpenseTransactions && isProjectExpenseTransactionReportDetail(detail)) ||
            (generalInvoiceTransactions && isGeneralInvoiceTransactionReportDetail(detail)) ||
            (generalExpenseTransactions && isGeneralExpenseTransactionReportDetail(detail)) ||
            (generalTransactions && isGeneralTransactionReportDetail(detail))
          "
          :external-link-url="transactionLink(detail)"
          header-separator
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="f.date(detail.transaction.issueDate) || undefined"
          subtitle-tooltip="Issue Date"
          :title="detail.transaction.code"
          title-full-width
        >
          <template #main>
            <StatusBadge class="q-mt-md" :status="detail.transaction.statusHelper" />
          </template>

          <template #side>
            <q-item-label caption class="text-overline">
              #{{ content.details.indexOf(detail) + 1 }}
              <TopTooltip>Number</TopTooltip>
            </q-item-label>
          </template>

          <template #bezel-less>
            <q-card-section class="q-col-gutter-sm row">
              <div v-if="!!detail.project" class="col-12">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/projects/${detail.project.urlFriendlyName}`"
                  :label="detail.project.name"
                  size="sm"
                  target="_blank"
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

              <div v-if="!!detail.customer" class="col-6">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/customers/${detail.customer.code}`"
                  icon="fal fa-user-crown"
                  :label="detail.customer.name"
                  size="sm"
                  target="_blank"
                />
              </div>

              <div v-if="detail.invoice" class="col-6">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/general-invoices/${detail.invoice.code.replaceAll(
                    '.',
                    '_',
                  )}`"
                  :label="detail.invoice.code"
                  size="sm"
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

              <div v-if="!!detail.supplier" class="col-6">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/suppliers/${detail.supplier.code}`"
                  icon="fal fa-building"
                  :label="detail.supplier.name"
                  size="sm"
                  target="_blank"
                />
              </div>

              <div v-if="detail.expense" class="col-6">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/general-expenses/${detail.expense.code.replaceAll(
                    '.',
                    '_',
                  )}`"
                  :label="detail.expense.code"
                  size="sm"
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

              <div v-if="!!detail.otherFinanceAccount" class="col-6">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/finance-accounts/${detail.otherFinanceAccount.id}`"
                  icon="fal fa-piggy-bank"
                  :label="detail.otherFinanceAccount.name"
                  size="sm"
                  target="_blank"
                />
              </div>

              <div class="col-12 text-body2">
                {{ detail.transaction.content }}
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="text-caption">
              <div v-if="detail.credit !== undefined" class="row justify-between q-gutter-x-xs">
                <div>Credit</div>
                <div>
                  {{ f.currency(detail.credit) }}
                </div>
              </div>
              <div v-if="detail.debit !== undefined" class="row justify-between q-gutter-x-xs">
                <div>Debit</div>
                <div>
                  {{ f.currency(detail.debit) }}
                </div>
              </div>
              <div class="row justify-between no-wrap q-gutter-x-sm">
                <div>Balance</div>
                <div
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
                </div>
              </div>
            </q-card-section>
          </template>
        </ExpandableCard>

        <q-card
          v-else
          v-show="balanceRecords"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          style="width: 100%"
          :style="{ maxWidth: listItemCardWidth + 'px' }"
        >
          <q-card-section class="q-pb-none">
            <div class="text-h6 text-center" :class="balanceRecordCssClass(index)">
              Balance Record
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row justify-between">
              <div>Date</div>
              <div :class="balanceRecordCssClass(index)">
                {{ f.date(detail.date) }}
              </div>
            </div>

            <div class="row justify-between">
              <div>Balance</div>
              <div :class="balanceRecordCssClass(index)">
                {{ f.currency(detail.balance) }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </template>
    </div>
  </div>
</template>
