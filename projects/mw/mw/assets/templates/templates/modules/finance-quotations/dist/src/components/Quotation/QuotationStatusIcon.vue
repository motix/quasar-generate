<script setup lang="ts">
// sort-imports-ignore

import type { Quotation } from 'models/finance/index.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// <% if (config.hasModule('finance-project-invoices')) { %>•+ finance-project-invoices
import QuotationTrailingInvoiceStatusIcon from 'components/Quotation/QuotationTrailingInvoiceStatusIcon.vue';
// •- /finance-project-invoices<% } else { %>•! finance-project-invoices absent<% } %>

// Props

defineProps<{ quotation: Quotation }>();
</script>

<template>
  <span>
    <StatusIcon icon="fal fa-file-invoice" :status="quotation.statusHelper" />

    <!-- <% if (config.hasModule('finance-project-invoices')) { %>•+ finance-project-invoices -->
    <QuotationTrailingInvoiceStatusIcon :quotation="quotation" />
    <!-- •- /finance-project-invoices<% } else { %>•! finance-project-invoices absent<% } %> -->
  </span>
</template>
