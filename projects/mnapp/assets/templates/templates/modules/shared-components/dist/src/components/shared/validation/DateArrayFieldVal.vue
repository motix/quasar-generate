<script setup lang="ts">
import { watch } from 'vue';

import { date, Platform } from 'quasar';

import { useField } from 'vee-validate';

import { requiredConfigEntries } from 'composables/useConfig.js';

// Props

type Props = {
  name: string;
};
const { name } = defineProps<Props>();

// Models

defineModel<string[] | null>({ required: true });

// Composables

const { editDateFormat } = requiredConfigEntries('editDateFormat');

const { value, errorMessage } = useField<string[] | null>(name, undefined, {
  syncVModel: true,
});

watch(value, (newValue) => {
  newValue?.sort(
    (a, b) =>
      date.extractDate(a, editDateFormat).valueOf() - date.extractDate(b, editDateFormat).valueOf(),
  );
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
        multiple
      />
    </template>
  </q-field>
</template>
