<script setup lang="ts">
import {
  isBalancedExpenseReportDetail,
  isUnbalancedExpenseReportDetail,
} from 'utils/reports/suppliers.js';

import type { SupplierReport, SupplierReportDetail } from 'models/reports/index.js';

import useSupplierReportSummary from 'composables/reports/supplier/useSupplierReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Props

const props = defineProps<{
  reportTitle: string;
  content: SupplierReport;
  balancedExpenses: boolean;
  unbalancedExpenses: boolean;
}>();

// Composables

const { cardWidth, listItemCardWidth, financeUrl } = requiredConfigEntries(
  'cardWidth',
  'listItemCardWidth',
  'financeUrl',
);

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
            <div>Total Expense</div>
            <div class="text-warning">
              {{ f.currency(totalExpenseAmount) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total Payment</div>
            <div class="text-warning">
              {{ f.currency(totalPaymentAmount) }}
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

      <ExpandableCard
        v-for="detail in content.details"
        v-show="
          (balancedExpenses && isBalancedExpenseReportDetail(detail)) ||
          (unbalancedExpenses && isUnbalancedExpenseReportDetail(detail))
        "
        :key="detail.document.id"
        :external-link-url="documentLink(detail)"
        header-separator
        :style="{ maxWidth: listItemCardWidth + 'px' }"
        :subtitle="f.date(detail.document.issueDate) || undefined"
        subtitle-tooltip="Issue Date"
        :title="detail.document.code"
        title-full-width
      >
        <template #main>
          <StatusBadge class="q-mt-md" :status="detail.document.statusHelper" />
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

            <div class="col-12 text-body2">
              {{ detail.document.content }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="text-caption">
            <div
              v-if="detail.expenseAmount !== undefined"
              class="row justify-between q-gutter-x-xs"
            >
              <div>Expense</div>
              <div>
                {{ f.currency(detail.expenseAmount) }}
              </div>
            </div>
            <div
              v-if="detail.paymentAmount !== undefined"
              class="row justify-between q-gutter-x-xs"
            >
              <div>Payment</div>
              <div>
                {{ f.currency(detail.paymentAmount) }}
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
    </div>
  </div>
</template>
