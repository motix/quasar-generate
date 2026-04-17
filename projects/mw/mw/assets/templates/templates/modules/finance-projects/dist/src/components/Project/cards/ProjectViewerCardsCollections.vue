<script setup lang="ts">
// sort-imports-ignore

// <% if (config.hasModule('finance-quotations')) { %>•+ finance-quotations
import QuotationsViewerCardsWrapper from 'components/Project/cards/QuotationsViewerCardsWrapper.vue';
// •- /finance-quotations<% } else { %>•! finance-quotations absent<% } %>

// <% if (config.hasModule('finance-project-expenses')) { %>•+ finance-project-expenses
import ExpensesViewerCardsWrapper from 'components/Project/cards/ExpensesViewerCardsWrapper.vue';
// •- /finance-project-expenses<% } else { %>•! finance-project-expenses absent<% } %>

// <% if (config.hasModule('finance-sales-contracts')) { %>•+ finance-sales-contracts
import ContractsViewerCardsWrapper from 'components/Project/cards/ContractsViewerCardsWrapper.vue';
// •- /finance-sales-contracts<% } else { %>•! finance-sales-contracts absent<% } %>

// <% if (config.hasModule('finance-project-messages')) { %>•+ finance-project-messages
import MessagesViewerCardsWrapper from 'components/Project/cards/MessagesViewerCardsWrapper.vue';
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

  <QuotationsViewerCardsWrapper :scope-name="scopeName" />
  <!-- •- /finance-quotations<% } else { %>•! finance-quotations absent<% } %> -->

  <!-- <% if (config.hasModule('finance-project-expenses')) { %>•+ finance-project-expenses -->
  <!-- Expenses -->

  <ExpensesViewerCardsWrapper :scope-name="scopeName" />
  <!-- •- /finance-project-expenses<% } else { %>•! finance-project-expenses absent<% } %> -->

  <!-- <% if (config.hasModule('finance-sales-contracts')) { %>•+ finance-sales-contracts -->
  <!-- Contracts -->

  <ContractsViewerCardsWrapper :scope-name="scopeName" />
  <!-- •- /finance-sales-contracts<% } else { %>•! finance-sales-contracts absent<% } %> -->

  <!-- <% if (config.hasModule('finance-project-messages')) { %>•+ finance-project-messages -->
  <!-- Messages -->

  <MessagesViewerCardsWrapper :scope-name="scopeName" />
  <!-- •- /finance-project-messages<% } else { %>•! finance-project-messages absent<% } %> -->
</template>
