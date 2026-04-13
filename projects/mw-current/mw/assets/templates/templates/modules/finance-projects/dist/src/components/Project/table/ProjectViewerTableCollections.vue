<script setup lang="ts">
// sort-imports-ignore

// <% if (config.hasModule('finance-quotations')) { %>•+ finance-quotations
import QuotationsViewerTableWrapper from 'components/Project/table/QuotationsViewerTableWrapper.vue';
// •- /finance-quotations<% } else { %>•! finance-quotations absent<% } %>

// <% if (config.hasModule('finance-project-expenses')) { %>•+ finance-project-expenses
import ExpensesViewerTableWrapper from 'components/Project/table/ExpensesViewerTableWrapper.vue';
// •- /finance-project-expenses<% } else { %>•! finance-project-expenses absent<% } %>

// <% if (config.hasModule('finance-sales-contracts')) { %>•+ finance-sales-contracts
import ContractsViewerTableWrapper from 'components/Project/table/ContractsViewerTableWrapper.vue';
// •- /finance-sales-contracts<% } else { %>•! finance-sales-contracts absent<% } %>

// <% if (config.hasModule('finance-project-messages')) { %>•+ finance-project-messages
import MessagesViewerTableWrapper from 'components/Project/table/MessagesViewerTableWrapper.vue';
// •- /finance-project-messages<% } else { %>•! finance-project-messages absent<% } %>

// Props

defineProps<{ scopeName: string }>();
</script>

<template>
  <!-- <% if (
  !config.hasModule('finance-quotations') &&
  !config.hasModule('finance-project-expenses') &&
  !config.hasModule('finance-sales-contracts') &&
  !config.hasModule('finance-project-messages')
) { %>•+ All absent -->
  <div></div>
  <!-- •- /All absent<% } else {%>•! At least 1 presents<% } %> -->

  <!-- <% if (config.hasModule('finance-quotations')) { %>•+ finance-quotations -->
  <!-- Quotations -->

  <QuotationsViewerTableWrapper :scope-name="scopeName" />
  <!-- •- /finance-quotations<% } else { %>•! finance-quotations absent<% } %> -->

  <!-- <% if (config.hasModule('finance-project-expenses')) { %>•+ finance-project-expenses -->
  <!-- Expenses -->

  <ExpensesViewerTableWrapper :scope-name="scopeName" />
  <!-- •- /finance-project-expenses<% } else { %>•! finance-project-expenses absent<% } %> -->

  <!-- <% if (config.hasModule('finance-sales-contracts')) { %>•+ finance-sales-contracts -->
  <!-- Contracts -->

  <ContractsViewerTableWrapper :scope-name="scopeName" />
  <!-- •- /finance-sales-contracts<% } else { %>•! finance-sales-contracts absent<% } %> -->

  <!-- <% if (config.hasModule('finance-project-messages')) { %>•+ finance-project-messages -->
  <!-- Messages -->

  <MessagesViewerTableWrapper :scope-name="scopeName" />
  <!-- •- /finance-project-messages<% } else { %>•! finance-project-messages absent<% } %> -->
</template>
