<script setup lang="ts">
import { Dark } from 'quasar';

import type { Quotation } from 'models/finance/index.js';

import useProjectViewPage_ProjectInvoices from 'composables/finance/project/useProjectViewPage_ProjectInvoices.js';

import InvoiceTransactionsViewerCardsWrapper from 'components/Project/cards/InvoiceTransactionsViewerCardsWrapper.vue';
import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

// Props

const props = defineProps<{
  scopeName: string;
  quotation: Quotation;
}>();

// Composables

const {
  // Auto sort
  m,
  onInvoiceClick,
  imc,
  f,
} = useProjectViewPage_ProjectInvoices(props.scopeName);
</script>

<template>
  <q-card-section v-if="!quotation.invoice" class="text-caption">
    This quotation doesn't have an invoice.
  </q-card-section>

  <ExpandableCard
    v-else
    avatar-icon="fal fa-file-invoice-dollar"
    avatar-size=""
    avatar-top
    class="no-shadow"
    clickable
    :external-link-url="`/project-invoices/${
      m.urlFriendlyName
    }/${quotation.invoice.code.replaceAll('.', '_')}`"
    :header-background-color="Dark.isActive ? 'grey-9' : 'grey-3'"
    header-separator
    side-top
    :title="quotation.invoice.code"
    title-top
    @click="onInvoiceClick(quotation.invoice!)"
  >
    <template #main>
      <div class="q-mt-sm">
        <StatusBadge :status="quotation.invoice.statusHelper" />
      </div>

      <div v-if="quotation.invoice.referenceNumber" class="q-mt-sm">
        <div
          v-for="(referenceNumber, index) of quotation.invoice.referenceNumber.split(', ')"
          :key="`${index}-${referenceNumber}`"
        >
          <ObjectLink icon="fal fa-hashtag" :label="referenceNumber" :ripple="false" />
        </div>
      </div>
    </template>

    <template #side>
      <q-item-label caption>
        {{ f.currency(imc.invoiceTotal(quotation.invoice)) }}
        <TopTooltip>Total</TopTooltip>
      </q-item-label>
      <q-item-label caption>
        {{ f.currency(imc.invoiceBalance(quotation.invoice)) }}
        <TopTooltip>Balance</TopTooltip>
      </q-item-label>
    </template>

    <template #bezel-less>
      <InvoiceTransactionsViewerCardsWrapper :invoice="quotation.invoice" :scope-name="scopeName" />
    </template>
  </ExpandableCard>
</template>
