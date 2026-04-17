<script setup lang="ts">
import { useTransactionViewPage } from 'composables/finance/transaction/useTransactionEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useMultiViews from 'composables/useMultiViews.js';

import TransactionDetailsViewerCards from 'components/Transaction/cards/TransactionDetailsViewerCards.vue';
import TransactionDetailsViewerTable from 'components/Transaction/table/TransactionDetailsViewerTable.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth } = requiredConfigEntries('cardWidth');

const { isTableView, isCardsView } = useMultiViews();

const $p = useTransactionViewPage(props.scopeName);
const {
  // Auto sort
  addDetail,
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
    <template v-if="m.details.length === 0">
      <div v-if="!readonlyMode" key="empty" class="text-center">
        <q-btn color="primary" label="Add Detail" @click="addDetail" />
      </div>
    </template>

    <TransactionDetailsViewerTable
      v-else-if="isTableView"
      key="tableView"
      :scope-name="scopeName"
    />

    <TransactionDetailsViewerCards
      v-else-if="isCardsView"
      key="cardsView"
      :scope-name="scopeName"
    />
  </FadeTransition>
</template>
