<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { faFileInvoiceDollar } from '@fortawesome/pro-light-svg-icons';
import { faBolt } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

import { Dark } from 'quasar';

import useQuotationViewPage_ProjectInvoices from 'composables/finance/quotation/useQuotationViewPage_ProjectInvoices.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  freezed,
  generateInvoice,
  generatingInvoice,
  showGenerateInvoiceButton,
} = useQuotationViewPage_ProjectInvoices(props.scopeName);

// Private Executions

library.add(faFileInvoiceDollar, faBolt);
</script>

<template>
  <q-btn
    v-show="showGenerateInvoiceButton"
    key="generateInvoice"
    class="shadow-2"
    :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
    :disable="freezed"
    :loading="generatingInvoice"
    outline
    padding="sm"
    text-color="primary"
    @click="generateInvoice"
  >
    <FontAwesomeLayers class="fa-lg" fixed-width style="margin-left: 1px; margin-right: 1px">
      <FontAwesomeIcon :icon="['fal', 'file-invoice-dollar']" size="lg" />
      <FontAwesomeIcon :icon="['fas', 'bolt']" size="lg" transform="shrink-10 up-8 left-9" />
    </FontAwesomeLayers>
    <TopTooltip>Generate Invoice</TopTooltip>
  </q-btn>
</template>
