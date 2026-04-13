<script setup lang="ts">
import { Dark } from 'quasar';

import { useInvoiceViewPage_SalesContracts } from 'composables/finance/invoice/useInvoiceEditPage_SalesContracts.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth, listItemCardWidth } = requiredConfigEntries('cardWidth', 'listItemCardWidth');

const {
  // Auto sort
  cmc,
  contracts,
  contractsReady,
  onContractClick,
  f,
} = useInvoiceViewPage_SalesContracts(props.scopeName);
</script>

<template>
  <FadeTransition>
    <div v-if="!contracts" key="loading">
      <FadeTransition>
        <div v-if="!contractsReady" class="text-center">
          Contracts loading<br />
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </FadeTransition>
    </div>

    <div v-else-if="contracts.length === 0" key="empty" class="text-center">
      <q-btn color="primary" label="Add Contract" to="/sales-contracts/new" />
    </div>

    <div v-else key="ready" class="q-gutter-y-md">
      <q-card
        class="q-mx-auto bg-accent"
        :class="Dark.isActive ? undefined : 'shadow-2'"
        dark
        style="width: 100%"
        :style="{ maxWidth: cardWidth + 'px' }"
      >
        <q-card-section>
          <div class="text-h6 text-center">Contracts</div>
        </q-card-section>
      </q-card>

      <!-- Bottom padding to be consistent with editor -->
      <div class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs">
        <ExpandableCard
          v-for="contract in contracts"
          :key="contract.id"
          avatar-icon="fal fa-file-signature"
          avatar-size=""
          avatar-top
          body-class="text-caption"
          clickable
          :external-link-url="`/sales-contracts/${contract.urlFriendlyCode}`"
          header-background-color="primary"
          header-dark
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="f.date(contract.signDate) || undefined"
          subtitle-tooltip="Sign Date"
          :title="contract.code"
          title-full-width
          title-top
          @click="onContractClick(contract)"
        >
          <template #main>
            <StatusBadge class="q-mt-sm" revert-color :status="contract.statusHelper" />
          </template>

          <template #bezel-less-top>
            <q-card-section class="text-body2">
              {{ contract.content }}
            </q-card-section>

            <q-separator />
          </template>

          <template #body>
            <div class="row justify-between">
              <div>Subtotal</div>
              <div>
                {{ f.currency(contract.subTotal) }}
              </div>
            </div>
            <div v-if="contract.arising !== undefined" class="row justify-between">
              <div>Arising</div>
              <div>
                {{ f.currency(contract.arising) }}
              </div>
            </div>
            <div v-if="contract.vatPercent !== undefined" class="row justify-between">
              <div>VAT ({{ f.percent(contract.vatPercent) }})</div>
              <div>
                {{ f.currency(cmc.salesContractVat(contract)) }}
              </div>
            </div>
            <div class="row justify-between">
              <div>
                <strong>Total</strong>
              </div>
              <div>
                <strong>{{ f.currency(cmc.salesContractTotal(contract)) }}</strong>
              </div>
            </div>
          </template>
        </ExpandableCard>
      </div>
    </div>
  </FadeTransition>
</template>
