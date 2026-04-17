<script setup lang="ts">
import type { Quotation } from 'models/finance/index.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

defineProps<{ quotation: Quotation }>();
</script>

<template>
  <template v-if="!!quotation.invoice">
    <q-icon name="fal fa-angle-right" size="10px" />

    <StatusIcon icon="fal fa-file-invoice-dollar" :status="quotation.invoice.statusHelper" />
  </template>
</template>
