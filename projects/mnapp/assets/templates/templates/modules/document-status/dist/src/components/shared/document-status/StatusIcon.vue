<script setup lang="ts">
import type DocumentStatusBase from 'utils/DocumentStatusBase.js';

const { revertColor = false } = defineProps<{
  status: DocumentStatusBase<unknown, string, string, string>;
  icon: string;
  revertColor?: boolean | undefined;
}>();
</script>

<template>
  <q-icon :color="revertColor ? status.textColor : status.backgroundColor" :name="icon" size="xs">
    <TopTooltip>
      {{ status.text }}
    </TopTooltip>
  </q-icon>
</template>
