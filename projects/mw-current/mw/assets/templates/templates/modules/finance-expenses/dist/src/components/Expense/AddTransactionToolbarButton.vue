<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { faExchange } from '@fortawesome/pro-light-svg-icons';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

import { Dark } from 'quasar';

import { useExpenseViewPage } from 'composables/finance/expense/useExpenseEditPage.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  freezed,
  newTransactionUrl,
  showAddTransactionButton,
} = useExpenseViewPage(props.scopeName);

// Private Executions

library.add(faExchange, faPlus);
</script>

<template>
  <q-btn
    v-show="showAddTransactionButton"
    key="addTransaction"
    class="shadow-2"
    :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
    :disable="freezed"
    outline
    padding="sm"
    text-color="primary"
    :to="newTransactionUrl"
  >
    <FontAwesomeLayers class="fa-lg" fixed-width style="margin-left: 1px; margin-right: 1px">
      <FontAwesomeIcon :icon="['fal', 'exchange']" size="lg" />
      <FontAwesomeIcon :icon="['fas', 'plus']" size="lg" transform="shrink-10 up-8 left-9" />
    </FontAwesomeLayers>
    <TopTooltip>Add Transaction</TopTooltip>
  </q-btn>
</template>
