<script setup lang="ts">
import type { VueClassProp } from 'quasar';

// Props

type Props = {
  fieldClass?: VueClassProp | undefined;
};
const { fieldClass = undefined } = defineProps<Props>();
</script>

<template>
  <q-field readonly>
    <template #control>
      <div class="self-center full-width no-outline" :class="fieldClass" tabindex="0">
        <slot></slot>
      </div>
    </template>
  </q-field>
</template>
