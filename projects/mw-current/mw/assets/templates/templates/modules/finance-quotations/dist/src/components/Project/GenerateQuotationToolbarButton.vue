<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { faFileInvoice } from '@fortawesome/pro-light-svg-icons';
import { faBolt } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

import { Dark } from 'quasar';

import useProjectViewPage_Quotations from 'composables/finance/project/useProjectViewPage_Quotations.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  freezed,
  generateQuotation,
  generatingQuotation,
  showGenerateQuotationButton,
} = useProjectViewPage_Quotations(props.scopeName);

// Private Executions

library.add(faFileInvoice, faBolt);
</script>

<template>
  <q-btn
    v-show="showGenerateQuotationButton"
    key="generateQuotation"
    class="shadow-2"
    :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
    :disable="freezed"
    :loading="generatingQuotation"
    outline
    padding="sm"
    text-color="primary"
    @click="generateQuotation"
  >
    <FontAwesomeLayers class="fa-lg" fixed-width style="margin-left: 1px; margin-right: 1px">
      <FontAwesomeIcon :icon="['fal', 'file-invoice']" size="lg" />
      <FontAwesomeIcon :icon="['fas', 'bolt']" size="lg" transform="shrink-10 up-8 left-9" />
    </FontAwesomeLayers>
    <TopTooltip>Generate Quotation</TopTooltip>
  </q-btn>
</template>
