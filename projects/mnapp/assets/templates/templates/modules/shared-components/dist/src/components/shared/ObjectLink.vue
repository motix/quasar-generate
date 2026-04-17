<script setup lang="ts">
import { ref } from 'vue';

import { copyToClipboard } from 'quasar';

// Props

type Props = {
  label: string;
  icon?: string | undefined;
  iconRight?: string | undefined;
  wrapLabel?: boolean | undefined;
  maxWidth?: string | undefined;
};
const {
  label,
  icon = undefined,
  iconRight = undefined,
  wrapLabel = false,
  maxWidth = '100%',
} = defineProps<Props>();

// Data

const hover = ref(false);
const labelCopied = ref(false);

// Methods

async function copyLabel() {
  await copyToClipboard(label);
  labelCopied.value = true;
}
</script>

<template>
  <q-btn
    class="q-pa-none"
    flat
    no-caps
    style="min-height: 0"
    :style="{ 'max-width': maxWidth }"
    @mouseleave="labelCopied = hover = false"
    @mouseover="
      (function () {
        hover = true;
        labelCopied = false;
      })()
    "
  >
    <!-- Setting max-width to support ellipsis -->
    <div class="row no-wrap" style="max-width: 100%">
      <div :class="{ 'text-left': icon !== undefined || $slots.icon, ellipsis: !wrapLabel }">
        <slot name="icon">
          <q-icon v-if="icon !== undefined" class="q-mr-sm" :name="icon" size="1.2em" />
        </slot>

        <span>
          {{ label }}
        </span>

        <slot name="iconRight">
          <q-icon v-if="iconRight !== undefined" class="q-ml-sm" :name="iconRight" size="1.2em" />
        </slot>
      </div>

      <div style="width: 0">
        <FadeTransition>
          <div
            v-if="hover && !labelCopied"
            class="q-px-xs"
            style="margin-right: -1.2em; margin-top: -0.5em"
            @click.stop.prevent="copyLabel"
          >
            <q-icon name="fal fa-copy" size="1.2em" />
          </div>
        </FadeTransition>
      </div>
    </div>
  </q-btn>
</template>

<style lang="scss" scoped>
.q-btn {
  line-height: $body-line-height;
}
</style>
