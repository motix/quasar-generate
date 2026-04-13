<script setup lang="ts">
import type { FinanceDetailsReport, FinanceDetailsReportDetail } from 'models/reports/index.js';

import useFinanceDetailsReportSummary from 'composables/reports/financeDetails/useFinanceDetailsReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{
  reportTitle: string;
  content: FinanceDetailsReport;
}>();

// Composables

const { financeUrl } = requiredConfigEntries('financeUrl');

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
              <th>Customer / Supplier</th>
              <th>Project</th>
              <th>Content</th>
              <th class="q-table--col-auto-width">Invoice</th>
              <th class="q-table--col-auto-width">Receipt</th>
              <th class="q-table--col-auto-width">Receivable</th>
              <th class="q-table--col-auto-width">Expense</th>
              <th class="q-table--col-auto-width">Payment</th>
              <th class="q-table--col-auto-width">Payable</th>
              <th class="q-table--col-auto-width">Available Cash</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th class="text-left" colspan="6">Beginning</th>
              <th colspan="2"></th>
              <th class="text-right">
                {{ f.currency(content.beginningReceivable) }}
              </th>
              <th colspan="2"></th>
              <th class="text-right">
                {{ f.currency(content.beginningPayable) }}
              </th>
              <th class="text-right">
                {{ f.currency(content.beginningAvailableCash) }}
              </th>
            </tr>

            <tr v-for="(detail, index) in content.details" :key="detail.document.id">
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
                        detail.document === detail.invoice
                          ? 'fal fa-file-invoice-dollar'
                          : detail.document === detail.expense
                            ? 'fal fa-receipt'
                            : 'fal fa-exchange'
                      "
                      :status="detail.document.statusHelper"
                    />
                  </template>
                </ObjectLink>
              </td>

              <!-- Customer / Supplier -->
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

              <!-- Invoice -->
              <td class="text-right">
                {{ f.currency(detail.invoiceAmount) }}
              </td>

              <!-- Receipt -->
              <td class="text-right">
                {{ f.currency(detail.receiptAmount) }}
              </td>

              <!-- Receivable -->
              <td
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
              </td>

              <!-- Expense -->
              <td class="text-right">
                {{ f.currency(detail.expenseAmount) }}
              </td>

              <!-- Payment -->
              <td class="text-right">
                {{ f.currency(detail.paymentAmount) }}
              </td>

              <!-- Payable -->
              <td
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
              </td>

              <!-- Available Cash -->
              <td
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
              </td>
            </tr>

            <tr>
              <!-- Number -->
              <!-- Issue Date -->
              <!-- Document -->
              <!-- Customer / Supplier -->
              <!-- Project -->
              <td class="text-left" colspan="5">Expense / Invoice Compositions</td>

              <!-- Content -->
              <td
                class="text-right text-overline text-weight-regular text-uppercase text-muted"
                style="border-left-width: 0; line-height: inherit"
              >
                <div>Capital</div>
                <div>External</div>
                <div>Business</div>
              </td>

              <!-- Invoice -->
              <td class="text-right">
                <div>
                  {{ f.currency(totalCapitalContributionAmount) }}
                </div>
                <div>
                  {{ f.currency(totalExternalInvoiceAmount) }}
                </div>
                <div>
                  {{ f.currency(totalBusinessInvoiceAmount) }}
                </div>
              </td>

              <!-- Receipt -->
              <td></td>

              <!-- Receivable -->
              <td></td>

              <!-- Expense -->
              <td class="text-right">
                <div>
                  {{ f.currency(totalCapitalWithdrawalAmount) }}
                </div>
                <div>
                  {{ f.currency(totalExternalExpenseAmount) }}
                </div>
                <div>
                  {{ f.currency(totalBusinessExpenseAmount) }}
                </div>
              </td>

              <!-- Payment -->
              <td></td>

              <!-- Payable -->
              <td></td>

              <!-- Available Cash -->
              <td></td>
            </tr>

            <tr>
              <!-- Number -->
              <!-- Issue Date -->
              <!-- Document -->
              <!-- Customer / Supplier -->
              <!-- Project -->
              <!-- Content -->
              <th class="text-left" colspan="6">Total / Ending</th>

              <!-- Invoice -->
              <th class="text-right">
                {{ f.currency(totalInvoiceAmount) }}
              </th>

              <!-- Receipt -->
              <th class="text-right">
                {{ f.currency(totalReceiptAmount) }}
              </th>

              <!-- Receivable -->
              <th class="text-right">
                {{ f.currency(content.endingReceivable) }}
              </th>

              <!-- Expense -->
              <th class="text-right">
                {{ f.currency(totalExpenseAmount) }}
              </th>

              <!-- Payment -->
              <th class="text-right">
                {{ f.currency(totalPaymentAmount) }}
              </th>

              <!-- Payable -->
              <th class="text-right">
                {{ f.currency(content.endingPayable) }}
              </th>

              <!-- Available Cash -->
              <th class="text-right">
                {{ f.currency(content.endingAvailableCash) }}
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
