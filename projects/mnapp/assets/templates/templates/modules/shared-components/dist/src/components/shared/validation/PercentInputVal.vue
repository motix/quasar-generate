<script setup lang="ts">
import { useField } from 'vee-validate';

// Props

type Props = {
  name: string;
  decimal?: number | undefined;
};
const { name, decimal = undefined } = defineProps<Props>();

// Model

defineModel<string | number | null>();

// Composables

const { errorMessage, value } = useField<string | number | null | undefined>(name, undefined, {
  syncVModel: true,
});
</script>

<template>
  <PercentInput
    v-model="value"
    :decimal="decimal"
    :error="!!errorMessage"
    :error-message="errorMessage"
  >
    <template #append>
      <slot name="append"></slot>
    </template>
  </PercentInput>
</template>
