<script setup lang="ts">
import type { Invoice, Transaction } from 'models/finance/index.js';

import useProjectViewPage_ProjectInvoices from 'composables/finance/project/useProjectViewPage_ProjectInvoices.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  f,
  imc,
  m,
  qmc,
  tmc,
  viewTransactionUrl,
} = useProjectViewPage_ProjectInvoices(props.scopeName);

// Data

const dumpTransactionList = [{ code: '_' } as Transaction];
const dumpInvoice = { code: '_', transactions: dumpTransactionList } as Invoice;
</script>

<template>
  <q-expansion-item
    expand-icon-class="text-white"
    header-class="text-white text-h6 bg-accent"
    icon="fal fa-file-invoice"
    label="Quotations"
    popup
  >
    <q-card>
      <StickyHeaders dense markup-table separated target="#quotationsViewerTable" />

      <q-markup-table id="quotationsViewerTable" bordered dense>
        <thead>
          <tr>
            <th class="cell-separator" colspan="2">Quotation</th>
            <th class="cell-separator" colspan="4">Invoice</th>
            <th colspan="4">Transaction</th>
          </tr>
          <tr>
            <!-- Quotation -->

            <th class="text-left">Code</th>
            <th class="cell-separator text-right">Total</th>

            <!-- Invoice -->

            <th class="text-left">Code</th>
            <th class="text-left">Ref. Number</th>
            <th class="text-right">Total</th>
            <th class="cell-separator text-right">Balance</th>

            <!-- Transaction -->

            <th>Issue Date</th>
            <th class="text-left">Code</th>
            <th>Type</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(quotation, quotationIndex) in m.quotations" :key="quotation.code">
            <template v-for="invoice in [quotation.invoice || dumpInvoice]">
              <tr
                v-for="(transaction, transactionIndex) in invoice.transactions.length > 0
                  ? invoice.transactions
                  : dumpTransactionList"
                :key="`${quotation.code}_${invoice.code}_${transaction.code}`"
              >
                <!-- Quotation -->

                <!-- Code -->
                <td
                  v-if="transactionIndex === 0"
                  class="vertical-top"
                  :class="{
                    'bottom-cell': quotationIndex === m.quotations.length - 1,
                  }"
                  :rowspan="invoice.transactions.length || 1"
                >
                  <ObjectLink
                    color="primary"
                    :label="quotation.code"
                    :to="`/quotations/${m.urlFriendlyName}/${quotation.code.replaceAll('.', '_')}`"
                  >
                    <template #icon>
                      <StatusIcon
                        class="q-mr-sm"
                        icon="fal fa-file-invoice"
                        :status="quotation.statusHelper"
                      />
                    </template>
                  </ObjectLink>
                </td>

                <!-- Total -->
                <td
                  v-if="transactionIndex === 0"
                  class="vertical-top text-right cell-separator"
                  :class="{
                    'bottom-cell': quotationIndex === m.quotations.length - 1,
                  }"
                  :rowspan="invoice.transactions.length || 1"
                >
                  {{ f.currency(qmc.quotationTotal(quotation)) }}
                </td>

                <!-- Invoice -->

                <!-- Code -->
                <!-- Ref. Number -->
                <!-- Total -->
                <!-- Balance -->
                <td
                  v-if="transactionIndex === 0 && !quotation.invoice"
                  class="cell-separator"
                  :class="{
                    'bottom-cell': quotationIndex === m.quotations.length - 1,
                  }"
                  colspan="4"
                ></td>
                <template v-else>
                  <!-- Code -->
                  <td
                    v-if="transactionIndex === 0"
                    class="vertical-top"
                    :class="{
                      'bottom-cell': quotationIndex === m.quotations.length - 1,
                    }"
                    :rowspan="invoice.transactions.length || 1"
                  >
                    <ObjectLink
                      color="primary"
                      :label="invoice.code"
                      :to="`/project-invoices/${
                        m.urlFriendlyName
                      }/${invoice.code.replaceAll('.', '_')}`"
                    >
                      <template #icon>
                        <StatusIcon
                          class="q-mr-sm"
                          icon="fal fa-file-invoice-dollar"
                          :status="invoice.statusHelper"
                        />
                      </template>
                    </ObjectLink>
                  </td>

                  <!-- Ref. Number -->
                  <td
                    v-if="transactionIndex === 0"
                    class="vertical-top"
                    :class="{
                      'bottom-cell': quotationIndex === m.quotations.length - 1,
                    }"
                    :rowspan="invoice.transactions.length || 1"
                  >
                    <template v-if="invoice.referenceNumber">
                      <div
                        v-for="(referenceNumber, index) of invoice.referenceNumber.split(', ')"
                        :key="`${index}-${referenceNumber}`"
                      >
                        <ObjectLink
                          icon="fal fa-hashtag"
                          :label="referenceNumber"
                          :ripple="false"
                        />
                      </div>
                    </template>
                  </td>

                  <!-- Total -->
                  <td
                    v-if="transactionIndex === 0"
                    class="vertical-top text-right"
                    :class="{
                      'bottom-cell': quotationIndex === m.quotations.length - 1,
                    }"
                    :rowspan="invoice.transactions.length || 1"
                  >
                    {{ f.currency(imc.invoiceTotal(invoice)) }}
                  </td>

                  <!-- Balance -->
                  <td
                    v-if="transactionIndex === 0"
                    class="vertical-top text-right cell-separator"
                    :class="{
                      'bottom-cell': quotationIndex === m.quotations.length - 1,
                    }"
                    :rowspan="invoice.transactions.length || 1"
                  >
                    {{ f.currency(imc.invoiceBalance(invoice)) }}
                  </td>
                </template>

                <!-- Transaction -->

                <!-- Issue Date -->
                <!-- Code -->
                <!-- Type -->
                <!-- Total -->
                <td
                  v-if="!quotation.invoice || quotation.invoice.transactions.length === 0"
                  colspan="4"
                ></td>
                <template v-else>
                  <!-- Issue Date -->
                  <td class="vertical-top text-center">
                    {{ f.date(transaction.issueDate) }}
                  </td>

                  <!-- Code -->
                  <td class="vertical-top">
                    <ObjectLink
                      color="primary"
                      :label="transaction.code"
                      :to="`${viewTransactionUrl}/${transaction.code.replaceAll('.', '_')}`"
                    >
                      <template #icon>
                        <StatusIcon
                          class="q-mr-sm"
                          icon="fal fa-exchange"
                          :status="transaction.statusHelper"
                        />
                      </template>
                    </ObjectLink>
                  </td>

                  <!-- Type -->
                  <td class="vertical-top text-center">
                    {{ transaction.type }}
                  </td>

                  <!-- Total -->
                  <td class="vertical-top text-right">
                    {{
                      f.currency(
                        tmc.transactionTotal(transaction) *
                          (tmc.transactionNegative(transaction) ? -1 : 1),
                      )
                    }}
                  </td>
                </template>
              </tr>
            </template>
          </template>
        </tbody>
      </q-markup-table>
    </q-card>
  </q-expansion-item>
</template>

<style lang="scss" scoped>
.cell-separator {
  border-right: 1px solid $table-border-color;
}

.q-table--dark .cell-separator {
  border-right-color: $table-dark-border-color;
}

.bottom-cell {
  border-bottom: 0px;
}
</style>
