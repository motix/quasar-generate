<script setup lang="ts">
import useInvoiceEditPage from 'composables/finance/invoice/useInvoiceEditPage.js';
import useMultiViews from 'composables/useMultiViews.js';

import InvoiceDetailsEditorCards from 'components/Invoice/cards/InvoiceDetailsEditorCards.vue';
import InvoiceDetailsViewerCards from 'components/Invoice/cards/InvoiceDetailsViewerCards.vue';
import InvoiceDetailsEditorTable from 'components/Invoice/table/InvoiceDetailsEditorTable.vue';
import InvoiceDetailsViewerTable from 'components/Invoice/table/InvoiceDetailsViewerTable.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { isTableView, isCardsView } = useMultiViews();

const $p = useInvoiceEditPage(props.scopeName);
const {
  // Auto sort
  vm,
} = $p;
</script>

<template>
  <template v-if="!$p.isNewPage($p)">
    <FadeTransition v-if="!$p.isCompleted.value">
      <div v-if="!$p.hasParent($p) && vm.details.length === 0" key="empty" class="text-center">
        <q-btn color="primary" label="Add Detail" @click="$p.addDetail" />
      </div>

      <InvoiceDetailsEditorTable v-else-if="isTableView" key="tableView" :scope-name="scopeName" />

      <InvoiceDetailsEditorCards v-else-if="isCardsView" key="cardsView" :scope-name="scopeName" />
    </FadeTransition>

    <FadeTransition v-else-if="vm.details.length > 0">
      <InvoiceDetailsViewerTable v-if="isTableView" key="tableView" :scope-name="scopeName" />

      <InvoiceDetailsViewerCards v-else-if="isCardsView" key="cardsView" :scope-name="scopeName" />
    </FadeTransition>
  </template>
</template>
