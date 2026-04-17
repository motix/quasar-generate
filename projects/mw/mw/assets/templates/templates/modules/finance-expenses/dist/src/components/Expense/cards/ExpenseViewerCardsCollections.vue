<script setup lang="ts">
/* sort-imports-ignore */

/* <% if (
  config.hasModule('finance-expense-groups')
) { %>•+ At least 1 presents */
import { useExpenseViewPage } from 'composables/finance/expense/useExpenseEditPage.js';

// <% if (config.hasModule('finance-expense-groups')) { %>•+ finance-expense-groups
import { useTemplateRef, watch, watchEffect } from 'vue';

// <% if (config.hasModule('finance-project-expense-groups')) { %>•+ finance-project-expense-groups
import type { Project } from 'models/finance/index.js';

import ExpenseGroupExpensesCardsWrapperProjectExpenseGroup from 'components/ExpenseGroup/cards/ExpenseGroupExpensesCardsWrapper_ProjectExpenseGroup.vue';
// •- /finance-project-expense-groups<% } else { %>•+ finance-project-expense-groups absent
import ExpenseGroupExpensesCardsWrapper from 'components/ExpenseGroup/cards/ExpenseGroupExpensesCardsWrapper.vue';
// •- /finance-project-expense-groups absent<% } %>
// •- /finance-expense-groups<% } else { %>•! finance-expense-groups absent<% } %>

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useExpenseViewPage(props.scopeName);
/* •- /At least 1 presents<% } else { %>•! All absent<% } %> */
// <% if (config.hasModule('finance-expense-groups')) { %>•+ finance-expense-groups
const { m } = $p;

// Data

const groupExpensesRef = useTemplateRef('groupExpenses');

// Watch

watchEffect(() => {
  $p.collectionsHaveItems.value.groupExpenses =
    !$p.editMode.value && (groupExpensesRef.value?.expenseRecords?.length || 0) > 0;
});

watch(m, (newValue) => {
  const index = groupExpensesRef.value?.expenseRecords?.findIndex(
    (record) => record.expense.code === newValue.code,
  );

  if (index !== undefined && index >= 0) {
    groupExpensesRef.value!.expenseRecords![index]!.expense = newValue;

    if ($p.hasParent($p)) {
      const { pm } = useExpenseViewPage<true, Project, never>(props.scopeName);

      groupExpensesRef.value!.expenseRecords![index]!.parent = pm.value;
    }
  }
});
// •- /finance-expense-groups<% } else { %>•! finance-expense-groups absent<% } %>
</script>

<template>
  <!-- <% if (
  !config.hasModule('finance-expense-groups')
) { %>•+ All absent -->
  <div></div>
  <!-- •- /All absent<% } else {%>•! At least 1 presents<% } %> -->

  <!-- <% if (config.hasModule('finance-expense-groups')) { %>•+ finance-expense-groups -->
  <!-- Group Expenses -->

  <!-- <% if (config.hasModule('finance-project-expense-groups')) { %>•+ finance-project-expense-groups -->
  <ExpenseGroupExpensesCardsWrapperProjectExpenseGroup
    v-if="m.group"
    ref="groupExpenses"
    :current-expense-code="m.code"
    :expense-group-id="m.group.id"
    :label="m.group.name"
    loading-message="Group Expenses loading"
  />
  <!-- •- /finance-project-expense-groups<% } else { %>•+ finance-project-expense-groups absent -->
  <ExpenseGroupExpensesCardsWrapper
    v-if="m.group"
    ref="groupExpenses"
    :current-expense-code="m.code"
    :expense-group-id="m.group.id"
    :label="m.group.name"
    loading-message="Group Expenses loading"
  />
  <!-- •- /finance-project-expense-groups absent<% } %> -->
  <!-- •- /finance-expense-groups<% } else { %>•! finance-expense-groups absent<% } %> -->
</template>
