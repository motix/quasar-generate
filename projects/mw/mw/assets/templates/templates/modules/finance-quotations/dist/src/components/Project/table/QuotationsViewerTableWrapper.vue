<script setup lang="ts">
// sort-imports-ignore

import useProjectViewPage_Quotations from 'composables/finance/project/useProjectViewPage_Quotations.js';

// <% if ((config.hasModule('finance-project-invoices'))) { %>•+ finance-project-invoices
import QuotationsViewerTableProjectInvoices from 'components/Project/table/QuotationsViewerTable_ProjectInvoices.vue';
// •- /finance-project-invoices<% } else { %>•+ finance-project-invoices absent
import QuotationsViewerTable from 'components/Project/table/QuotationsViewerTable.vue';
// •- finance-project-invoices absent<% } %>

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  firstQuotationGenerating,
  generateQuotation,
  hasGenerateQuotation,
  m,
  readonlyMode,
} = useProjectViewPage_Quotations(props.scopeName);
</script>

<template>
  <ListTransition no-tag>
    <template v-if="m.quotations.length === 0 || firstQuotationGenerating">
      <!-- Smoothing enter animation -->
      <div key="smoothing"></div>

      <q-item v-if="!readonlyMode && hasGenerateQuotation" key="generateQuotation" class="q-py-md">
        <div class="text-center full-width">
          <q-btn color="primary" label="Generate Quotation" @click="generateQuotation" />
        </div>
      </q-item>
    </template>

    <template v-else>
      <!-- <% if (config.hasModule('finance-project-invoices')) { %>•+ finance-project-invoices -->
      <QuotationsViewerTableProjectInvoices key="quotations" :scope-name="scopeName" />
      <!-- •- /finance-project-invoices<% } else { %>•+ finance-project-invoices absent -->
      <QuotationsViewerTable key="quotations" :scope-name="scopeName" />
      <!-- •- finance-project-invoices absent <% } %> -->
    </template>
  </ListTransition>
</template>
