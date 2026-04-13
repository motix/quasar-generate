<script setup lang="ts">
import { computed } from 'vue';

import { Dark } from 'quasar';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

// Props

const props = defineProps<{
  scopeName: string;
  vatInvoiceIndex: number;
}>();

// Composables

const { listItemCardWidth } = requiredConfigEntries('listItemCardWidth');

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  f,
  mc,
} = $p;

// Computed

const vatInvoice = computed(
  () =>
    $p.m.value.vatInvoices[props.vatInvoiceIndex] ||
    (() => {
      throw new Error('[finance-sales-contracts] Index out of range');
    })(),
);
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-file-invoice-dollar"
    avatar-size=""
    avatar-top
    body-class="text-caption"
    :header-background-color="Dark.isActive ? 'grey-8' : 'grey-4'"
    side-top
    :style="{ maxWidth: listItemCardWidth + 'px' }"
    :subtitle="f.date(vatInvoice.issueDate) || undefined"
    subtitle-tooltip="Issue Date"
    :title="vatInvoice.code"
  >
    <template #side>
      <q-item-label caption class="text-overline">
        #{{ vatInvoiceIndex + 1 }}
        <TopTooltip>Number</TopTooltip>
      </q-item-label>

      <q-toggle
        v-model="vatInvoice.isCancelled"
        checked-icon="fal fa-check"
        class="right-toggle"
        color="primary"
        disable
        unchecked-icon="clear"
      >
        <TopTooltip>Cancelled</TopTooltip>
      </q-toggle>
    </template>

    <template #bezel-less-top>
      <q-card-section class="text-body2" :class="{ 'text-muted': vatInvoice.isCancelled }">
        {{ vatInvoice.content }}
      </q-card-section>

      <q-separator />
    </template>

    <template #body>
      <div class="row justify-between">
        <div>Subtotal</div>
        <div :class="{ 'text-muted': vatInvoice.isCancelled }">
          {{ f.currency(vatInvoice.subTotal) }}
        </div>
      </div>
      <div v-if="vatInvoice.vatPercent !== undefined" class="row justify-between">
        <div>
          VAT
          <span :class="{ 'text-muted': vatInvoice.isCancelled }">
            ({{ f.percent(vatInvoice.vatPercent)
            }}{{
              vatInvoice.vatAdjustment !== undefined
                ? `, ${vatInvoice.vatAdjustment > 0 ? '+' : ''}${f.currency(
                    vatInvoice.vatAdjustment,
                  )}`
                : ''
            }})
          </span>
        </div>
        <div :class="{ 'text-muted': vatInvoice.isCancelled }">
          {{ f.currency(mc.vatInvoiceVat(vatInvoice)) }}
        </div>
      </div>
      <div class="row justify-between">
        <div>
          <strong>Total</strong>
        </div>
        <div :class="{ 'text-muted': vatInvoice.isCancelled }">
          <strong>{{ f.currency(mc.vatInvoiceTotal(vatInvoice)) }}</strong>
        </div>
      </div>
    </template>
  </ExpandableCard>
</template>
