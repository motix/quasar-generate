<script setup lang="ts">
import { useField } from 'vee-validate';

// Props

type Props = {
  name: string;
};
const { name } = defineProps<Props>();

// Models

defineModel<unknown>();

// Composables

const { errorMessage, value } = useField(name, undefined, { syncVModel: true });
</script>

<template>
  <q-select v-model="value" :error="!!errorMessage" :error-message="errorMessage" />
</template>
