<script setup lang="ts">
import { useTemplateRef } from 'vue';

import type { QDateProps } from 'quasar';
import { QPopupProxy } from 'quasar';

import { useField } from 'vee-validate';

import { requiredConfigEntries } from 'composables/useConfig.js';

// Props

type Props = {
  name: string;
  optional?: boolean | undefined;
  dateOptions?: QDateProps['options'];
};
const { name, optional = false, dateOptions = undefined } = defineProps<Props>();

// Models

defineModel<string | null>();

// Composables

const { dateFormat, editDateFormat, dateMask } = requiredConfigEntries(
  'dateFormat',
  'editDateFormat',
  'dateMask',
);

const { value, errorMessage } = useField<string | null | undefined>(name, undefined, {
  syncVModel: true,
});

// Data

const popupProxyRef = useTemplateRef('popupProxy');
</script>

<template>
  <q-input
    v-model="value"
    :clearable="optional"
    :error="!!errorMessage"
    :error-message="errorMessage"
    :hint="dateFormat + (optional ? ' (optional)' : '')"
    :mask="dateMask"
    unmasked-value
  >
    <template #append>
      <q-icon class="cursor-pointer" name="fal fa-calendar-day">
        <q-popup-proxy ref="popupProxy" cover transition-hide="scale" transition-show="scale">
          <q-date
            v-model="value"
            :mask="editDateFormat"
            :options="dateOptions"
            @update:model-value="popupProxyRef?.hide()"
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>
