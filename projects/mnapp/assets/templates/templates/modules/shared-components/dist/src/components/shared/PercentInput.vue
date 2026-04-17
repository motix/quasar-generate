<script setup lang="ts">
import { computed } from 'vue';

import { isFinite } from 'lodash-es';

// Private

function percentRound(value: number) {
  return decimal
    ? Math.round(value * Math.pow(10, 2 + decimal)) / Math.pow(10, 2 + decimal)
    : value;
}

// Without this, 110% will display as 110.00000000000001%
function percentDisplayRound(value: number) {
  return Math.round(value * 10000000000000) / 10000000000000;
}

function validateValue(value: string | number | null | undefined): value is number {
  const valueAsNumber = parseFloat(String(value));

  return isFinite(value) && valueAsNumber === value;
}

// Props

type Props = {
  decimal?: number | undefined;
};
const { decimal = undefined } = defineProps<Props>();

// Models

const model = defineModel<string | number | null>();

// Computed

const isValueValid = computed(() => validateValue(model.value));

const displayValue = computed(() =>
  validateValue(model.value)
    ? percentDisplayRound(percentRound(model.value) * 100).toString()
    : model.value?.toString() || '',
);

// Methods

function onUpdate(value: string | null) {
  let roundedValue: string | number | null = null;

  if (value != null) {
    const valueAsNumber = parseFloat(value);
    roundedValue =
      isFinite(valueAsNumber) && String(valueAsNumber) === value
        ? percentRound(valueAsNumber / 100)
        : value;
  }

  if (roundedValue !== model.value) {
    model.value = roundedValue;
  }
}
</script>

<template>
  <q-input
    class="percent"
    :model-value="displayValue"
    :suffix="isValueValid ? '%' : undefined"
    @update:model-value="onUpdate($event as string | null)"
  >
    <template v-if="$slots.loading" #loading>
      <slot name="loading"></slot>
    </template>
  </q-input>
</template>

<style scoped lang="scss">
.percent :deep() .q-field__suffix {
  padding-left: 0;
}
</style>
