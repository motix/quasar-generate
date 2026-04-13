<script setup lang="ts">
import type { SalesContract } from 'models/finance/index.js';
import type { SalesVatInvoicesReport } from 'models/reports/index.js';

import useSalesContractCalculator from 'composables/finance/sales-contract/useSalesContractCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

defineProps<{
  reportTitle: string;
  content: SalesVatInvoicesReport;
}>();

// Composables

const { financeUrl } = requiredConfigEntries('financeUrl');

const f = useFormats();

const mc = useSalesContractCalculator<SalesContract>();
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
              <th>Code</th>
              <th>Cancelled</th>
              <th>Content</th>
              <th>Amount</th>
              <th>Sales Contract</th>
              <th>Projects / General Invoices</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(detail, index) in content"
              :key="`${detail.salesContract.code}-${detail.document.code}`"
            >
              <!-- Number -->
              <td class="text-right">
                {{ index + 1 }}
              </td>

              <!-- Issue Date -->
              <td class="text-center">
                {{ f.date(detail.document.issueDate) }}
              </td>

              <!-- Code -->
              <td>
                {{ detail.document.code }}
              </td>

              <!-- Cancelled -->
              <td>
                <q-toggle
                  v-model="detail.document.isCancelled"
                  checked-icon="fal fa-check"
                  color="primary"
                  disable
                  unchecked-icon="clear"
                />
              </td>

              <!-- Content -->
              <td class="text-wrap" :class="{ 'text-muted': detail.document.isCancelled }">
                {{ detail.document.content }}
              </td>

              <!-- Amount -->
              <td class="text-right">
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>Subtotal</div>
                  <div :class="{ 'text-muted': detail.document.isCancelled }">
                    {{ f.currency(detail.document.subTotal) }}
                  </div>
                </div>
                <div
                  v-if="detail.document.vatPercent !== undefined"
                  class="row justify-between no-wrap q-gutter-x-sm"
                >
                  <div>
                    VAT
                    <span :class="{ 'text-muted': detail.document.isCancelled }">
                      ({{ f.percent(detail.document.vatPercent) }})
                    </span>
                  </div>
                  <div :class="{ 'text-muted': detail.document.isCancelled }">
                    {{ f.currency(mc.vatInvoiceVat(detail.document)) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>
                    <strong>Total</strong>
                  </div>
                  <div :class="{ 'text-muted': detail.document.isCancelled }">
                    <strong>
                      {{ f.currency(mc.vatInvoiceTotal(detail.document)) }}
                    </strong>
                  </div>
                </div>
              </td>

              <!-- Sales Contract -->
              <td class="text-wrap">
                <div class="row justify-between no-wrap q-gutter-x-xs">
                  <div>
                    <div>
                      <ObjectLink
                        color="primary"
                        :href="`${financeUrl}/sales-contracts/${detail.salesContract.urlFriendlyCode}`"
                        :label="detail.salesContract.code"
                        target="_blank"
                        wrap-label
                      >
                        <template #icon>
                          <StatusIcon
                            class="q-mr-sm"
                            icon="fal fa-file-signature fa-fw"
                            :status="detail.salesContract.statusHelper"
                          />
                        </template>
                      </ObjectLink>
                    </div>
                    <div>
                      <ObjectLink
                        color="primary"
                        :href="`${financeUrl}/customers/${detail.salesContract.customer.code}`"
                        icon="fal fa-user-crown"
                        :label="detail.salesContract.customer.name"
                        target="_blank"
                        wrap-label
                      />
                    </div>
                  </div>
                  <q-toggle
                    v-model="detail.salesContract.isArchived"
                    checked-icon="fal fa-box-taped"
                    class="right-toggle"
                    color="primary"
                    disable
                    unchecked-icon="fal fa-box-open"
                  >
                    <TopTooltip>Archived</TopTooltip>
                  </q-toggle>
                </div>
                <div class="text-caption">
                  {{ detail.salesContract.content }}
                </div>
                <div
                  v-if="detail.salesContract.notes !== undefined"
                  class="text-caption text-italic q-mt-xs"
                  :class="{
                    'bg-negative text-white q-px-sm q-py-xs rounded-borders shadow-2':
                      detail.salesContract.notes!.startsWith('!'),
                  }"
                >
                  {{ detail.salesContract.notes }}
                </div>
              </td>

              <!-- Projects / General Invoices -->
              <td class="text-wrap">
                <div
                  v-for="project in detail.salesContract.projects"
                  :key="project.id"
                  class="row justify-between no-wrap q-gutter-x-xs"
                >
                  <ObjectLink
                    color="primary"
                    :href="`${financeUrl}/projects/${project.urlFriendlyName}`"
                    :label="project.name"
                    target="_blank"
                    wrap-label
                  >
                    <template #icon>
                      <StatusIcon
                        class="q-mr-sm"
                        icon="fal fa-briefcase"
                        :status="project.statusHelper"
                      />
                    </template>
                  </ObjectLink>
                  <q-toggle
                    v-model="project.isArchived"
                    checked-icon="fal fa-box-taped"
                    class="right-toggle"
                    color="primary"
                    disable
                    unchecked-icon="fal fa-box-open"
                  >
                    <TopTooltip>Archived</TopTooltip>
                  </q-toggle>
                </div>
                <div
                  v-for="invoice in detail.salesContract.generalInvoices"
                  :key="invoice.id"
                  class="row justify-between no-wrap q-gutter-x-xs"
                >
                  <ObjectLink
                    color="primary"
                    :href="`${financeUrl}/general-invoices/${invoice.code.replaceAll('.', '_')}`"
                    :label="invoice.code"
                    target="_blank"
                  >
                    <template #icon>
                      <StatusIcon
                        class="q-mr-sm"
                        icon="fal fa-file-invoice-dollar"
                        :status="invoice.statusHelper"
                      />
                    </template>
                  </ObjectLink>
                  <q-toggle
                    v-model="invoice.isArchived"
                    checked-icon="fal fa-box-taped"
                    class="right-toggle"
                    color="primary"
                    disable
                    unchecked-icon="fal fa-box-open"
                  >
                    <TopTooltip>Archived</TopTooltip>
                  </q-toggle>
                </div>
              </td>
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
</style>
