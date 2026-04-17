<script setup lang="ts">
import { useTemplateRef } from 'vue';

import { QTooltip } from 'quasar';

// Data

const tooltipRef = useTemplateRef('tooltip');

// Methods

function hide() {
  tooltipRef.value?.hide();
}

// Expose

defineExpose({
  hide,
});
</script>

<template>
  <q-tooltip ref="tooltip" anchor="top middle" self="bottom middle">
    <slot></slot>
  </q-tooltip>
</template>
