<script setup lang="ts">
import { Platform } from 'quasar';

import { useField } from 'vee-validate';

import { requiredConfigEntries } from 'composables/useConfig.js';

// Props

type Props = {
  name: string;
};
const { name } = defineProps<Props>();

// Models

defineModel<string | null>();

// Composables

const { editDateFormat } = requiredConfigEntries('editDateFormat');

const { value, errorMessage } = useField<string | null | undefined>(name, undefined, {
  syncVModel: true,
});
</script>

<template>
  <q-field v-model="value" :error="!!errorMessage" :error-message="errorMessage" stack-label>
    <template #control>
      <q-date
        v-model="value"
        class="q-mt-sm full-width"
        :landscape="Platform.is.desktop"
        :mask="editDateFormat"
      />
    </template>
  </q-field>
</template>
