<script setup lang="ts">
import { useTemplateRef, watchEffect } from 'vue';

import type { InvoiceGroup, InvoiceGroupVm } from 'models/finance/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useMultiViews from 'composables/useMultiViews.js';

import InvoiceGroupInvoicesCardsWrapper from './cards/InvoiceGroupInvoicesCardsWrapper.vue';
import InvoiceGroupInvoicesTableWrapper from './table/InvoiceGroupInvoicesTableWrapper.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { isTableView, isCardsView } = useMultiViews();

const $p = useViewPage<InvoiceGroup, InvoiceGroupVm>(props.scopeName);
const {
  // Auto sort
  freezed,
  m,
} = $p;

// Data

const invoicesRef = useTemplateRef('invoices');

// Watch

watchEffect(() => {
  $p.hasMultiViews.value = (invoicesRef.value?.invoiceRecords?.length || 0) > 0;
});
</script>

<template>
  <div class="q-gutter-y-lg">
    <ExpandableCard
      avatar-icon="fal fa-layer-group"
      :caption="m.description"
      class="q-mx-auto"
      header-background-color="primary"
      header-dark
      :title="m.name"
    >
      <template #side>
        <q-toggle
          v-model="m.isActive"
          checked-icon="fal fa-power-off"
          class="right-toggle"
          color="white"
          :disable="freezed"
          icon-color="primary"
          label="Active"
          left-label
          unchecked-icon="clear"
        />
      </template>
    </ExpandableCard>

    <FadeTransition>
      <div v-if="isTableView" key="tableView">
        <q-list class="rounded-list">
          <InvoiceGroupInvoicesTableWrapper
            ref="invoices"
            default-opened
            :invoice-group-id="m.id"
          />
        </q-list>
      </div>

      <div v-else-if="isCardsView" key="cardsView" class="q-gutter-y-lg">
        <InvoiceGroupInvoicesCardsWrapper ref="invoices" :invoice-group-id="m.id" />
      </div>
    </FadeTransition>
  </div>
</template>
