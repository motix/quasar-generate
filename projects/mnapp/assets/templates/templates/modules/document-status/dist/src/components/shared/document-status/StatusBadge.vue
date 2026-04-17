<script setup lang="ts">
import type DocumentStatusBase from 'utils/DocumentStatusBase.js';

const { revertColor = false } = defineProps<{
  status: DocumentStatusBase<unknown, string, string, string>;
  revertColor?: boolean | undefined;
}>();
</script>

<template>
  <q-btn
    class="shadow-2 no-pointer-events"
    :color="revertColor ? status.textColor : status.backgroundColor"
    no-wrap
    padding="xs"
    :ripple="false"
    size="sm"
    :text-color="revertColor ? status.backgroundColor : status.textColor"
    unelevated
  >
    <q-icon class="q-mr-xs" name="fal fa-thermometer-half" />
    <span class="text-weight-bold q-mr-xs">{{ status.text }}</span>
  </q-btn>
</template>
