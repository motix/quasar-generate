<script setup lang="ts">
import { computed } from 'vue';

import { isFinite } from 'lodash-es';

// Private

function oneThousandRound(value: number) {
  return Math.round(value / 1000) * 1000;
}

function validateValue(value: string | number | null | undefined): value is number {
  const valueAsNumber = parseInt(String(value));

  return (
    isFinite(value) &&
    (valueAsNumber === value ||
      `${String(valueAsNumber)}E0` === value ||
      `${String(valueAsNumber)}e0` === value)
  );
}

function validateThousandValue(value: string | number | null | undefined) {
  const valueAsNumber = parseInt(String(value));

  return (
    isFinite(value) && valueAsNumber === value && oneThousandRound(valueAsNumber) === valueAsNumber
  );
}

// Props

type Props = {
  suffix?: string | undefined;
};
const { suffix = undefined } = defineProps<Props>();

// Models

const model = defineModel<string | number | null>();

// Computed

const displayValue = computed(() =>
  validateValue(model.value)
    ? validateThousandValue(model.value)
      ? (oneThousandRound(model.value) / 1000).toString()
      : `${model.value}E0`
    : model.value?.toString() || '',
);

const thousandSuffix = computed(() =>
  validateValue(model.value) && validateThousandValue(model.value) && model.value > 0
    ? '000' + (suffix || '')
    : suffix,
);

// Methods

function onUpdate(value: string | null) {
  let newValue: string | number | null = null;

  if (value != null) {
    const valueAsNumber = parseInt(value);

    newValue =
      isFinite(valueAsNumber) && String(valueAsNumber) === value
        ? valueAsNumber * 1000
        : isFinite(valueAsNumber) &&
            (`${String(valueAsNumber)}E0` === value || `${String(valueAsNumber)}e0` === value)
          ? valueAsNumber
          : value;
  }

  if (newValue !== model.value) {
    model.value = newValue;
  }
}
</script>

<template>
  <q-input
    :model-value="displayValue"
    :suffix="thousandSuffix"
    @update:model-value="onUpdate($event as string | null)"
  >
    <template v-if="$slots.loading" #loading>
      <slot name="loading"></slot>
    </template>
  </q-input>
</template>
