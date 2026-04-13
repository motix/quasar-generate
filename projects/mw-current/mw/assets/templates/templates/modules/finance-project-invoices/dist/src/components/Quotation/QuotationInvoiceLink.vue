<script setup lang="ts">
import useQuotationViewPage from 'composables/finance/quotation/useQuotationViewPage.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useQuotationViewPage(props.scopeName);
const {
  // Auto sort
  m,
  pm,
} = $p;
</script>

<template>
  <div class="col-6 text-right">
    <ObjectLink
      v-if="m.invoice"
      color="primary"
      :label="m.invoice.code"
      :to="`/project-invoices/${pm.urlFriendlyName}/${m.invoice.code.replaceAll('.', '_')}`"
    >
      <template #icon>
        <StatusIcon
          class="q-mr-sm"
          icon="fal fa-file-invoice-dollar"
          :status="m.invoice.statusHelper"
        />
      </template>
    </ObjectLink>
  </div>
</template>
