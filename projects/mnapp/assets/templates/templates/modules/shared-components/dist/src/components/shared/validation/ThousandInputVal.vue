<script setup lang="ts">
import { useField } from 'vee-validate';

// Props

type Props = {
  name: string;
};
const { name } = defineProps<Props>();

// Models

defineModel<string | number | null>();

// Composables

const { errorMessage, value } = useField<string | number | null | undefined>(name, undefined, {
  syncVModel: true,
});
</script>

<template>
  <ThousandInput v-model="value" :error="!!errorMessage" :error-message="errorMessage">
    <template #append>
      <slot name="append"></slot>
    </template>
  </ThousandInput>
</template>
