<script setup lang="ts">
import { computed } from 'vue';

import type { SalesContract } from 'models/finance/index.js';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

// Props

const props = defineProps<{
  scopeName: string;
  contractIndex: number;
  contract: SalesContract;
}>();

// Composables

const { listItemCardWidth } = requiredConfigEntries('listItemCardWidth');

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  f,
  mc,
  onContractClick,
} = $p;

// Computed

const contract = computed(() =>
  props.contractIndex === 0
    ? $p.m.value
    : $p.sameProjectSalesContracts.value[props.contractIndex - 1] ||
      (() => {
        throw new Error('[finance-sales-contracts] Index out of range');
      })(),
);
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-file-signature"
    avatar-size=""
    avatar-top
    body-class="text-caption"
    :clickable="contractIndex > 0"
    :external-link-url="
      contractIndex === 0 ? undefined : `/sales-contracts/${contract.urlFriendlyCode}`
    "
    header-background-color="primary"
    header-dark
    side-top
    :style="{ maxWidth: listItemCardWidth + 'px' }"
    :subtitle="f.date(contract.signDate) || undefined"
    subtitle-tooltip="Sign Date"
    :title="contract.code"
    title-full-width
    title-top
    @click="contractIndex > 0 && onContractClick(contract)"
  >
    <template #main>
      <StatusBadge class="q-mt-sm" revert-color :status="contract.statusHelper" />
    </template>

    <template #side>
      <q-item-label caption class="text-overline"> #{{ contractIndex + 1 }} </q-item-label>
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
          {{ f.currency(mc.salesContractVat(contract)) }}
        </div>
      </div>
      <div class="row justify-between">
        <div>
          <strong>Total</strong>
        </div>
        <div>
          <strong>{{ f.currency(mc.salesContractTotal(contract)) }}</strong>
        </div>
      </div>
    </template>
  </ExpandableCard>
</template>
