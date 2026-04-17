<script setup lang="ts">
import { useInvoiceViewPage } from 'composables/finance/invoice/useInvoiceEditPage.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useInvoiceViewPage(props.scopeName);
const {
  // Auto sort
  f,
  m,
  newTransactionUrl,
  readonlyMode,
  tmc,
  viewTransactionUrl,
} = $p;
</script>

<template>
  <FadeTransition>
    <template v-if="m.transactions.length === 0">
      <q-item v-if="!readonlyMode" key="addTransaction" class="q-py-md">
        <div class="text-center full-width">
          <q-btn color="primary" label="Add Transaction" :to="newTransactionUrl" />
        </div>
      </q-item>
    </template>

    <q-expansion-item
      v-else
      key="transactions"
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      icon="fal fa-exchange"
      label="Transactions"
      popup
    >
      <q-card>
        <StickyHeaders dense markup-table separated target="#transactionsViewerTable" />

        <q-markup-table id="transactionsViewerTable" bordered dense>
          <thead>
            <tr>
              <th>Issue Date</th>
              <th class="text-left">Code</th>
              <th>Type</th>
              <th class="text-left">Content</th>
              <th>From</th>
              <th>To</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            <!-- Details -->
            <tr v-for="transaction in m.transactions" :key="transaction.code">
              <!-- Issue Date -->
              <td class="text-center">
                {{ f.date(transaction.issueDate) }}
              </td>

              <!-- Code -->
              <td>
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
              <td class="text-center">
                {{ transaction.type }}
              </td>

              <!-- Content -->
              <td class="text-wrap">
                {{ transaction.content }}
              </td>

              <!-- From -->
              <td class="text-center">
                {{ transaction.sourceFinanceAccount?.name }}
                <ObjectLink
                  v-if="!tmc.transactionNegative(transaction)"
                  color="primary"
                  icon="fal fa-user-crown"
                  :label="m.customer.name"
                  :to="`/customers/${m.customer.code}`"
                />
              </td>

              <!-- To -->
              <td class="text-center">
                {{ transaction.destinationFinanceAccount?.name }}
                <ObjectLink
                  v-if="tmc.transactionNegative(transaction)"
                  color="primary"
                  icon="fal fa-user-crown"
                  :label="m.customer.name"
                  :to="`/customers/${m.customer.code}`"
                />
              </td>

              <!-- Total -->
              <td class="text-right">
                {{
                  f.currency(
                    tmc.transactionTotal(transaction) *
                      (tmc.transactionNegative(transaction) ? -1 : 1),
                  )
                }}
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-expansion-item>
  </FadeTransition>
</template>
