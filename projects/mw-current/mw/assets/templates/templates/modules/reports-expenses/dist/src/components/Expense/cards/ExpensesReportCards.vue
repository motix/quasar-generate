<script setup lang="ts">
import {
  isGeneralExpenseReportDetail,
  isProjectExpenseReportDetail,
} from 'utils/reports/expenses.js';

import type { ExpensesReport, ExpensesReportDetail } from 'models/reports/index.js';

import useExpensesReportSummary from 'composables/reports/expense/useExpensesReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

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

const { cardWidth, listItemCardWidth, financeUrl } = requiredConfigEntries(
  'cardWidth',
  'listItemCardWidth',
  'financeUrl',
);

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
            <div>Total Expense</div>
            <div class="text-warning">
              {{ f.currency(totalExpense) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total Payment</div>
            <div class="text-warning">
              {{ f.currency(totalPayment, true) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total Balance</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(totalBalance) }}
              </strong>
            </div>
          </div>
        </q-card-section>

        <template v-if="content.financeAccounts.length > 0">
          <q-separator dark inset />

          <q-card-section>
            <q-slide-transition>
              <div
                v-if="!content.financeAccounts.some((value) => selectedFinanceAccounts[value.id])"
              >
                No finance account selected.
              </div>
            </q-slide-transition>

            <q-slide-transition
              v-for="financeAccount in content.financeAccounts"
              :key="financeAccount.id"
            >
              <div v-if="selectedFinanceAccounts[financeAccount.id]" class="row justify-between">
                <div>{{ financeAccount.name }}</div>
                <div class="text-warning">
                  {{ f.currency(totalPaymentByFinanceAccount[financeAccount.id]) }}
                </div>
              </div>
            </q-slide-transition>
          </q-card-section>
        </template>
      </q-card>

      <div class="flex-break q-mt-none"></div>

      <template v-for="(detail, index) in content.details" :key="detail.expense.id">
        <ExpandableCard
          v-show="
            ((showProjectExpenses && isProjectExpenseReportDetail(detail)) ||
              (showGeneralExpenses && isGeneralExpenseReportDetail(detail))) &&
            (detail.expense.group
              ? selectedExpenseGroups[detail.expense.group.id]
              : selectedExpenseGroups[''])
          "
          :external-link-url="expenseLink(detail)"
          header-separator
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="f.date(detail.expense.issueDate) || undefined"
          subtitle-tooltip="Issue Date"
          :title="detail.expense.code"
          title-full-width
        >
          <template #main>
            <div>
              <ObjectLink
                v-if="detail.expense.group"
                :href="`${financeUrl}/expense-groups/${detail.expense.group.id}`"
                icon-right="fal fa-layer-group"
                :label="detail.expense.group.name"
                size="sm"
                target="_blank"
              />
            </div>

            <div class="q-mt-md">
              <StatusBadge :status="detail.expense.statusHelper" />
            </div>
          </template>

          <template #side>
            <q-item-label caption class="text-overline">
              #{{ index + 1 }}
              <TopTooltip>Number</TopTooltip>
            </q-item-label>
          </template>

          <template #bezel-less>
            <q-card-section class="q-col-gutter-sm row">
              <div class="col-6">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/suppliers/${detail.expense.supplier.code}`"
                  icon="fal fa-user-crown"
                  :label="detail.expense.supplier.name"
                  size="sm"
                  target="_blank"
                />
              </div>

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
                {{ detail.expense.content }}
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="text-caption">
              <div class="row justify-between q-gutter-x-xs">
                <div>Total</div>
                <div>
                  {{ f.currency(detail.total) }}
                </div>
              </div>
              <div class="row justify-between q-gutter-x-xs">
                <div>Total Payment</div>
                <div>
                  {{ f.currency(detail.totalPayment, true) }}
                </div>
              </div>
              <div class="row justify-between q-gutter-x-xs">
                <div>
                  <strong>Balance</strong>
                </div>
                <div>
                  <strong>{{ f.currency(detail.balance) }}</strong>
                </div>
              </div>
            </q-card-section>

            <template v-if="Object.keys(detail.totalPaymentByFinanceAccount).length > 0">
              <q-separator />

              <q-card-section class="text-caption">
                <q-slide-transition>
                  <div
                    v-if="
                      !content.financeAccounts
                        .filter(
                          (value) => detail.totalPaymentByFinanceAccount[value.id] !== undefined,
                        )
                        .some((value) => selectedFinanceAccounts[value.id])
                    "
                  >
                    No finance account for this expense selected.
                  </div>
                </q-slide-transition>

                <q-slide-transition
                  v-for="financeAccount in content.financeAccounts.filter(
                    (value) => detail.totalPaymentByFinanceAccount[value.id] !== undefined,
                  )"
                  :key="financeAccount.id"
                >
                  <div
                    v-if="selectedFinanceAccounts[financeAccount.id]"
                    class="row justify-between q-gutter-x-xs"
                  >
                    <div>{{ financeAccount.name }}</div>
                    <div>
                      {{ f.currency(detail.totalPaymentByFinanceAccount[financeAccount.id]) }}
                    </div>
                  </div>
                </q-slide-transition>
              </q-card-section>
            </template>
          </template>
        </ExpandableCard>
      </template>
    </div>
  </div>
</template>
