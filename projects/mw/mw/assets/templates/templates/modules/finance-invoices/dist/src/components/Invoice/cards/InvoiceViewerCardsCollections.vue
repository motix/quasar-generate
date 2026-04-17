<script setup lang="ts">
/* sort-imports-ignore */

/* <% if (
  config.hasModule('finance-invoice-groups') ||
  config.hasModule('finance-sales-contracts')
) { %>•+ At least 1 presents */
import { useInvoiceViewPage } from 'composables/finance/invoice/useInvoiceEditPage.js';

// <% if (config.hasModule('finance-invoice-groups')) { %>•+ finance-invoice-groups
import { useTemplateRef, watch, watchEffect } from 'vue';

// <% if (config.hasModule('finance-project-invoice-groups')) { %>•+ finance-project-invoice-groups
import type { Project } from 'models/finance/index.js';

import InvoiceGroupInvoicesCardsWrapperProjectInvoiceGroup from 'components/InvoiceGroup/cards/InvoiceGroupInvoicesCardsWrapper_ProjectInvoiceGroup.vue';
// •- /finance-project-invoice-groups<% } else { %>•+ finance-project-invoice-groups absent
import InvoiceGroupInvoicesCardsWrapper from 'components/InvoiceGroup/cards/InvoiceGroupInvoicesCardsWrapper.vue';
// •- /finance-project-invoice-groups absent<% } %>
// •- /finance-invoice-groups<% } else { %>•! finance-invoice-groups absent<% } %>

// <% if (config.hasModule('finance-sales-contracts')) { %>•+ finance-sales-contracts
import ContractsViewerCardsWrapper from 'components/Invoice/cards/ContractsViewerCardsWrapper.vue';
// •- /finance-sales-contracts<% } else { %>•! finance-sales-contracts absent<% } %>

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useInvoiceViewPage(props.scopeName);
/* •- /At least 1 presents<% } else { %>•! All absent<% } %> */
// <% if (config.hasModule('finance-invoice-groups')) { %>•+ finance-invoice-groups
const { m } = $p;

// Data

const groupInvoicesRef = useTemplateRef('groupInvoices');

// Watch

watchEffect(() => {
  $p.collectionsHaveItems.value.groupInvoices =
    !$p.editMode.value && (groupInvoicesRef.value?.invoiceRecords?.length || 0) > 0;
});

watch(m, (newValue) => {
  const index = groupInvoicesRef.value?.invoiceRecords?.findIndex(
    (record) => record.invoice.code === newValue.code,
  );

  if (index !== undefined && index >= 0) {
    groupInvoicesRef.value!.invoiceRecords![index]!.invoice = newValue;

    if ($p.hasParent($p)) {
      const { pm } = useInvoiceViewPage<true, Project, never>(props.scopeName);

      groupInvoicesRef.value!.invoiceRecords![index]!.parent = pm.value;
    }
  }
});
// •- /finance-invoice-groups<% } else { %>•! finance-invoice-groups absent<% } %>
</script>

<template>
  <!-- <% if (
  !config.hasModule('finance-invoice-groups') &&
  !config.hasModule('finance-sales-contracts')
) { %>•+ All absent -->
  <div></div>
  <!-- •- /All absent<% } else {%>•! At least 1 presents<% } %> -->

  <!-- <% if (config.hasModule('finance-sales-contracts')) { %>•+ finance-sales-contracts -->
  <!-- Contracts -->

  <ContractsViewerCardsWrapper v-if="!$p.hasParent($p)" :scope-name="scopeName" />
  <!-- •- /finance-sales-contracts<% } else { %>•! finance-sales-contracts absent<% } %> -->

  <!-- <% if (config.hasModule('finance-invoice-groups')) { %>•+ finance-invoice-groups -->
  <!-- Group Invoices -->

  <!-- <% if (config.hasModule('finance-project-invoice-groups')) { %>•+ finance-project-invoice-groups -->
  <InvoiceGroupInvoicesCardsWrapperProjectInvoiceGroup
    v-if="m.group"
    ref="groupInvoices"
    :current-invoice-code="m.code"
    :invoice-group-id="m.group.id"
    :label="m.group.name"
    loading-message="Group Invoices loading"
  />
  <!-- •- /finance-project-invoice-groups<% } else { %>•+ finance-project-invoice-groups absent -->
  <InvoiceGroupInvoicesCardsWrapper
    v-if="m.group"
    ref="groupInvoices"
    :current-invoice-code="m.code"
    :invoice-group-id="m.group.id"
    :label="m.group.name"
    loading-message="Group Invoices loading"
  />
  <!-- •- /finance-project-invoice-groups absent<% } %> -->
  <!-- •- /finance-invoice-groups<% } else { %>•! finance-invoice-groups absent<% } %> -->
</template>
