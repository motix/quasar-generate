<script setup lang="ts">
import { requiredConfigEntries } from 'composables/useConfig.js';

// Props

type Props = {
  fixedPadding?: number | undefined;
  topFloatPadding?: number | undefined;
  bottomFloatPadding?: number | undefined;
};
const {
  fixedPadding = requiredConfigEntries('fixedPadding').fixedPadding,
  topFloatPadding = requiredConfigEntries('topFloatPadding').topFloatPadding,
  bottomFloatPadding = requiredConfigEntries('bottomFloatPadding').bottomFloatPadding,
} = defineProps<Props>();

// Methods

function styleFn(offset: number, height: number) {
  return {
    minHeight: `${height - offset - fixedPadding}px`,
  };
}
</script>

<template>
  <q-page :style-fn="styleFn">
    <div
      :style="{
        paddingTop: `${topFloatPadding}px`,
        paddingBottom: `${bottomFloatPadding}px`,
      }"
    >
      <slot></slot>
    </div>
  </q-page>
</template>
