<script setup lang="ts">
import { useInvoiceViewPage } from 'composables/finance/invoice/useInvoiceEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useMultiViews from 'composables/useMultiViews.js';

import InvoiceDetailsViewerCards from 'components/Invoice/cards/InvoiceDetailsViewerCards.vue';
import InvoiceTransactionsViewerCardsWrapper from 'components/Invoice/cards/InvoiceTransactionsViewerCardsWrapper.vue';
import InvoiceViewerCardsCollections from 'components/Invoice/cards/InvoiceViewerCardsCollections.vue';
import InvoiceDetailsViewerTable from 'components/Invoice/table/InvoiceDetailsViewerTable.vue';
import InvoiceTransactionsViewerTableWrapper from 'components/Invoice/table/InvoiceTransactionsViewerTableWrapper.vue';
import InvoiceViewerTableCollections from 'components/Invoice/table/InvoiceViewerTableCollections.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth } = requiredConfigEntries('cardWidth');

const { isTableView, isCardsView } = useMultiViews();

const $p = useInvoiceViewPage(props.scopeName);
const {
  // Auto sort
  addDetail,
  isCompleted,
  m,
  readonlyMode,
} = $p;
</script>

<template>
  <q-card
    v-if="m.notes !== undefined"
    class="q-mx-auto"
    style="width: 100%"
    :style="{ maxWidth: cardWidth + 'px' }"
  >
    <q-card-section
      class="text-caption text-italic"
      :class="{
        'bg-negative text-white': m.notes.startsWith('!'),
      }"
    >
      {{ m.notes }}
    </q-card-section>
  </q-card>

  <FadeTransition>
    <div v-if="isTableView" key="tableView">
      <q-list class="rounded-list">
        <!-- Details -->

        <InvoiceDetailsViewerTable v-if="$p.hasParent($p)" :scope-name="scopeName" />

        <ListTransition v-else no-tag>
          <template v-if="m.details.length === 0">
            <!-- Smoothing enter animation -->
            <div key="smoothing"></div>

            <q-item v-if="!readonlyMode && !isCompleted" key="addDetail" class="q-py-md">
              <div class="text-center full-width">
                <q-btn color="primary" label="Add Detail" @click="addDetail" />
              </div>
            </q-item>
          </template>

          <InvoiceDetailsViewerTable v-else key="details" :scope-name="scopeName" />
        </ListTransition>

        <!-- Transactions -->

        <InvoiceTransactionsViewerTableWrapper :scope-name="scopeName" />

        <InvoiceViewerTableCollections :scope-name="scopeName" />
      </q-list>
    </div>

    <div v-else-if="isCardsView" key="cardsView" class="q-gutter-y-lg">
      <!-- Details -->

      <InvoiceDetailsViewerCards v-if="$p.hasParent($p)" :scope-name="scopeName" />

      <ListTransition v-else :gutter="24" no-tag>
        <!-- Smoothing enter animation -->
        <div key="smoothing"></div>

        <template v-if="m.details.length === 0">
          <div v-if="!readonlyMode && !isCompleted" key="addDetail" class="text-center">
            <q-btn color="primary" label="Add Detail" @click="addDetail" />
          </div>
        </template>

        <InvoiceDetailsViewerCards v-else key="details" :scope-name="scopeName" />
      </ListTransition>

      <!-- Transactions -->

      <InvoiceTransactionsViewerCardsWrapper :scope-name="scopeName" />

      <InvoiceViewerCardsCollections :scope-name="scopeName" />
    </div>
  </FadeTransition>
</template>
