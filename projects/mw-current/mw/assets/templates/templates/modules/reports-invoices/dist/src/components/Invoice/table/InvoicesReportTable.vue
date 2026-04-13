<script setup lang="ts">
import {
  isGeneralInvoiceReportDetail,
  isProjectInvoiceReportDetail,
} from 'utils/reports/invoices.js';

import type { InvoicesReport, InvoicesReportDetail } from 'models/reports/index.js';

import useInvoicesReportSummary from 'composables/reports/invoice/useInvoicesReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{
  reportTitle: string;
  content: InvoicesReport;
  showProjectInvoices: boolean;
  showGeneralInvoices: boolean;
  selectedFinanceAccounts: { [index: string]: boolean };
  selectedInvoiceGroups: { [index: string]: boolean };
}>();

// Composables

const { financeUrl } = requiredConfigEntries('financeUrl');

const f = useFormats();

const { totalInvoice, totalReceipt, totalBalance, totalReceiptByFinanceAccount } =
  useInvoicesReportSummary(props.content.details, props.content.financeAccounts);

// Methods

function invoiceLink(detail: InvoicesReportDetail) {
  return `${financeUrl}/${
    detail.project ? `project-invoices/${detail.project.urlFriendlyName}` : 'general-invoices'
  }/${detail.invoice.code.replaceAll('.', '_')}`;
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
              <th>Invoice</th>
              <th>
                <template v-if="showProjectInvoices && !showGeneralInvoices">Project</template>
                <template v-else-if="!showProjectInvoices && showGeneralInvoices">Content</template>
                <template v-else>Project / Content</template>
              </th>
              <th>Group</th>
              <th>Customer</th>
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
                ((showProjectInvoices && isProjectInvoiceReportDetail(detail)) ||
                  (showGeneralInvoices && isGeneralInvoiceReportDetail(detail))) &&
                (detail.invoice.group
                  ? selectedInvoiceGroups[detail.invoice.group.id]
                  : selectedInvoiceGroups[''])
              "
              :key="detail.invoice.id"
            >
              <!-- Number -->
              <td class="text-right">
                {{ index + 1 }}
              </td>

              <!-- Issue Date -->
              <td class="text-center">
                {{ f.date(detail.invoice.issueDate) }}
              </td>

              <!-- Invoice -->
              <td>
                <ObjectLink
                  color="primary"
                  :href="invoiceLink(detail)"
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
                <template v-else>
                  {{ detail.invoice.content }}
                </template>
              </td>

              <!-- Group -->
              <td style="max-width: 150px">
                <ObjectLink
                  v-if="detail.invoice.group"
                  color="primary"
                  :href="`${financeUrl}/invoice-groups/${detail.invoice.group.id}`"
                  icon="fal fa-layer-group"
                  :label="detail.invoice.group.name"
                  target="_blank"
                />
              </td>

              <!-- Customer -->
              <td style="max-width: 150px">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/customers/${detail.invoice.customer.code}`"
                  icon="fal fa-user-crown"
                  :label="detail.invoice.customer.name"
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
                  <div>Total Receipt</div>
                  <div>
                    {{ f.currency(detail.totalReceipt, true) }}
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
                {{ f.currency(detail.totalReceiptByFinanceAccount[financeAccount.id]) }}
              </td>
            </tr>

            <tr>
              <!-- Number -->
              <!-- Issue Date -->
              <!-- Invoice -->
              <!-- Project / Content -->
              <!-- Group -->
              <!-- Customer -->
              <th class="text-right" colspan="6">Total</th>

              <!-- Balance -->
              <td>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>Total</div>
                  <div>
                    {{ f.currency(totalInvoice) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>Total Receipt</div>
                  <div>
                    {{ f.currency(totalReceipt, true) }}
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
                {{ f.currency(totalReceiptByFinanceAccount[financeAccount.id]) }}
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
