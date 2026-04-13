<script setup lang="ts">
import { useInvoiceViewPage_SalesContracts } from 'composables/finance/invoice/useInvoiceEditPage_SalesContracts.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  cmc,
  contracts,
  contractsReady,
  f,
} = useInvoiceViewPage_SalesContracts(props.scopeName);
</script>

<template>
  <FadeTransition>
    <q-item v-if="!contracts" key="loading" class="q-py-md">
      <FadeTransition>
        <div v-if="!contractsReady" class="text-center full-width">
          Contracts loading<br />
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </FadeTransition>
    </q-item>

    <q-item v-else-if="contracts.length === 0" key="empty" class="q-py-md">
      <div class="text-center full-width">
        <q-btn color="primary" label="Add Contract" to="/sales-contracts/new" />
      </div>
    </q-item>

    <q-expansion-item
      v-else
      key="ready"
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      icon="fal fa-file-signature"
      label="Contracts"
      popup
    >
      <q-card>
        <StickyHeaders dense markup-table separated target="#contractsViewerTable" />

        <q-markup-table id="contractsViewerTable" bordered dense wrap-cells>
          <thead>
            <tr>
              <th class="q-table--col-auto-width">Sign Date</th>
              <th class="text-left">Code</th>
              <th class="text-left">Content</th>
              <th class="q-table--col-auto-width">Status</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">Arising</th>
              <th class="text-right">VAT</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="contract in contracts" :key="contract.id">
              <!-- Sign Date -->
              <td>
                {{ f.date(contract.signDate) }}
              </td>

              <!-- Code -->
              <td>
                <ObjectLink
                  color="primary"
                  :label="contract.code"
                  :to="`/sales-contracts/${contract.urlFriendlyCode}`"
                >
                  <template #icon>
                    <StatusIcon
                      class="q-mr-sm"
                      icon="fal fa-file-signature fa-fw"
                      :status="contract.statusHelper"
                    />
                  </template>
                </ObjectLink>
              </td>

              <!-- Content -->
              <td>
                {{ contract.content }}
              </td>

              <!-- Status -->
              <q-td class="text-center">
                <StatusBadge :status="contract.statusHelper" />
              </q-td>

              <!-- Subtotal -->
              <td class="text-right">
                {{ f.currency(contract.subTotal) }}
              </td>

              <!-- Arising -->
              <td class="text-right">
                <template v-if="contract.arising !== undefined">
                  {{ f.currency(contract.arising) }}
                </template>
              </td>

              <!-- VAT -->
              <td>
                <div
                  v-if="contract.vatPercent !== undefined"
                  class="row justify-between no-wrap q-gutter-x-xs"
                >
                  <span>({{ f.percent(contract.vatPercent) }})</span>
                  {{ f.currency(cmc.salesContractVat(contract)) }}
                </div>
              </td>

              <!-- Total -->
              <td class="text-right">
                {{ f.currency(cmc.salesContractTotal(contract)) }}
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-expansion-item>
  </FadeTransition>
</template>
