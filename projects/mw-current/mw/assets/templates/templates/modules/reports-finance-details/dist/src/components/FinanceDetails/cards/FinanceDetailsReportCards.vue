<script setup lang="ts">
import type { FinanceDetailsReport, FinanceDetailsReportDetail } from 'models/reports/index.js';

import useFinanceDetailsReportSummary from 'composables/reports/financeDetails/useFinanceDetailsReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Props

const props = defineProps<{
  reportTitle: string;
  content: FinanceDetailsReport;
}>();

// Composables

const { cardWidth, listItemCardWidth, financeUrl } = requiredConfigEntries(
  'cardWidth',
  'listItemCardWidth',
  'financeUrl',
);

const f = useFormats();

const {
  totalInvoiceAmount,
  totalCapitalContributionAmount,
  totalExternalInvoiceAmount,
  totalBusinessInvoiceAmount,
  totalReceiptAmount,
  totalExpenseAmount,
  totalCapitalWithdrawalAmount,
  totalExternalExpenseAmount,
  totalBusinessExpenseAmount,
  totalPaymentAmount,
} = useFinanceDetailsReportSummary(props.content.details);

// Methods

function documentLink(detail: FinanceDetailsReportDetail) {
  return `${financeUrl}/${
    detail.document === detail.invoice
      ? detail.project
        ? `project-invoices/${detail.project.urlFriendlyName}`
        : 'general-invoices'
      : detail.document === detail.expense
        ? detail.project
          ? `project-expenses/${detail.project.urlFriendlyName}`
          : 'general-expenses'
        : detail.project
          ? `project-transactions/${detail.project.urlFriendlyName}`
          : detail.invoice
            ? `general-invoice-transactions/${detail.invoice.code.replaceAll('.', '_')}`
            : detail.expense
              ? `general-expense-transactions/${detail.expense.code.replaceAll('.', '_')}`
              : 'general-transactions'
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
            <div>Beginning Receivable</div>
            <div class="text-warning">
              {{ f.currency(content.beginningReceivable) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total Invoice</div>
            <div class="text-warning">
              {{ f.currency(totalInvoiceAmount) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total Receipt</div>
            <div class="text-warning">
              {{ f.currency(totalReceiptAmount) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Ending Receivable</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(content.endingReceivable) }}
              </strong>
            </div>
          </div>
        </q-card-section>

        <q-separator dark inset />

        <q-card-section>
          <div class="row justify-between">
            <div>Capital Contribution</div>
            <div class="text-warning">
              {{ f.currency(totalCapitalContributionAmount) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>External Invoice</div>
            <div class="text-warning">
              {{ f.currency(totalExternalInvoiceAmount) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Business Invoice</div>
            <div class="text-warning">
              {{ f.currency(totalBusinessInvoiceAmount) }}
            </div>
          </div>
        </q-card-section>

        <q-separator dark inset />

        <q-card-section>
          <div class="row justify-between">
            <div>Beginning Payable</div>
            <div class="text-warning">
              {{ f.currency(content.beginningPayable) }}
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
            <div>Ending Payable</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(content.endingPayable) }}
              </strong>
            </div>
          </div>
        </q-card-section>

        <q-separator dark inset />

        <q-card-section>
          <div class="row justify-between">
            <div>Capital Withdrawal</div>
            <div class="text-warning">
              {{ f.currency(totalCapitalWithdrawalAmount) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>External Expense</div>
            <div class="text-warning">
              {{ f.currency(totalExternalExpenseAmount) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Business Expense</div>
            <div class="text-warning">
              {{ f.currency(totalBusinessExpenseAmount) }}
            </div>
          </div>
        </q-card-section>

        <q-separator dark inset />

        <q-card-section>
          <div class="row justify-between">
            <div>Beginning Available Cash</div>
            <div class="text-warning">
              {{ f.currency(content.beginningAvailableCash) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Ending Available Cash</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(content.endingAvailableCash) }}
              </strong>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="flex-break q-mt-none"></div>

      <ExpandableCard
        v-for="(detail, index) in content.details"
        :key="detail.document.id"
        :external-link-url="documentLink(detail)"
        header-separator
        side-top
        :style="{ maxWidth: listItemCardWidth + 'px' }"
        :subtitle="f.date(detail.document.issueDate) || undefined"
        subtitle-tooltip="Issue Date"
        :title="detail.document.code"
        title-full-width
      >
        <template #main>
          <StatusBadge class="q-mt-md" :status="detail.document.statusHelper" />
        </template>

        <template #side>
          <q-item-label caption class="text-overline">
            #{{ index + 1 }}
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

            <div class="col-12 text-body2">
              {{ detail.document.content }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="text-caption">
            <div
              v-if="detail.invoiceAmount !== undefined"
              class="row justify-between q-gutter-x-xs"
            >
              <div>Invoice</div>
              <div>
                {{ f.currency(detail.invoiceAmount) }}
              </div>
            </div>
            <div
              v-if="detail.receiptAmount !== undefined"
              class="row justify-between q-gutter-x-xs"
            >
              <div>Receipt</div>
              <div>
                {{ f.currency(detail.receiptAmount) }}
              </div>
            </div>
            <div class="row justify-between no-wrap q-gutter-x-sm">
              <div>Receivable</div>
              <div
                class="text-right"
                :class="{
                  'text-positive': detail.receivableIncreased,
                  'text-negative': detail.receivableDecreased,
                }"
              >
                <div style="height: 0">
                  <q-icon
                    v-if="detail.receivableIncreased"
                    name="fas fa-chevron-double-up"
                    size="8px"
                    style="top: -12px"
                  />
                  <q-icon
                    v-if="detail.receivableDecreased"
                    name="fas fa-chevron-double-down"
                    size="8px"
                    style="bottom: -10px"
                  />
                </div>
                {{ f.currency(detail.receivable) }}
              </div>
            </div>

            <q-separator spaced />

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
              <div>Payable</div>
              <div
                class="text-right"
                :class="{
                  'text-positive': detail.payableIncreased,
                  'text-negative': detail.payableDecreased,
                }"
              >
                <div style="height: 0">
                  <q-icon
                    v-if="detail.payableIncreased"
                    name="fas fa-chevron-double-up"
                    size="8px"
                    style="top: -12px"
                  />
                  <q-icon
                    v-if="detail.payableDecreased"
                    name="fas fa-chevron-double-down"
                    size="8px"
                    style="bottom: -10px"
                  />
                </div>
                {{ f.currency(detail.payable) }}
              </div>
            </div>

            <q-separator spaced />

            <div class="row justify-between no-wrap q-gutter-x-sm">
              <div>Available Cash</div>
              <div
                class="text-right"
                :class="{
                  'text-positive': detail.availableCashIncreased,
                  'text-negative': detail.availableCashDecreased,
                }"
              >
                <div style="height: 0">
                  <q-icon
                    v-if="detail.availableCashIncreased"
                    name="fas fa-chevron-double-up"
                    size="8px"
                    style="top: -12px"
                  />
                  <q-icon
                    v-if="detail.availableCashDecreased"
                    name="fas fa-chevron-double-down"
                    size="8px"
                    style="bottom: -10px"
                  />
                </div>
                {{ f.currency(detail.availableCash) }}
              </div>
            </div>
          </q-card-section>
        </template>
      </ExpandableCard>
    </div>
  </div>
</template>
