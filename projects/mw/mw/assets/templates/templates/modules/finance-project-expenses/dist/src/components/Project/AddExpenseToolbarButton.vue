<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { faReceipt } from '@fortawesome/pro-light-svg-icons';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

import { Dark } from 'quasar';

import useProjectViewPage_ProjectExpenses from 'composables/finance/project/useProjectViewPage_ProjectExpenses.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  freezed,
  m,
  showAddExpenseButton,
} = useProjectViewPage_ProjectExpenses(props.scopeName);

// Private Executions

library.add(faReceipt, faPlus);
</script>

<template>
  <q-btn
    v-show="showAddExpenseButton"
    key="addExpense"
    class="shadow-2"
    :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
    :disable="freezed"
    outline
    padding="sm"
    text-color="primary"
    :to="`/project-expenses/${m.urlFriendlyName}/new`"
  >
    <FontAwesomeLayers class="fa-lg" fixed-width style="margin-left: 1px; margin-right: 1px">
      <FontAwesomeIcon :icon="['fal', 'receipt']" size="lg" />
      <FontAwesomeIcon :icon="['fas', 'plus']" size="lg" transform="shrink-10 up-8 left-9" />
    </FontAwesomeLayers>
    <TopTooltip>Add Expense</TopTooltip>
  </q-btn>
</template>
