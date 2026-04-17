<script setup lang="ts">
import type { VNodeTypes } from 'vue';
import { Comment, computed, ref, useTemplateRef } from 'vue';

import { QFab } from 'quasar';

import { useFloatToolbarResult } from 'composables/useFloatToolbar.js';

// Props

const {
  position = 'bottom-right',
  minMarginY = 2,
  fabButtonsVisibility = undefined,
  fabButtonsSpaceIgnored = 0,
  offset = {},
  persistent = false,
} = defineProps<{
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | undefined;
  minMarginY?: number | undefined;
  fabButtonsVisibility?: Record<string, boolean> | undefined;
  fabButtonsSpaceIgnored?: number | undefined;
  offset?: { x?: number; y?: number } | undefined;
  persistent?: boolean | undefined;
}>();

// Slots

const slots = defineSlots<{
  default(): { type: VNodeTypes }[];
  'fixed-buttons': () => unknown;
  'second-row-buttons': () => unknown;
}>();

// Composables

const { floatToolbarOffsetTop, floatToolbarOffsetBottom } = useFloatToolbarResult();

// Data

const PAGE_PADDING = 16;
const QFAB_BTN_SIZE = 56;
const QFAB_ACTIONS_PADDING = 3;
const QFAB_ACTIONS_MARGIN = 9;
const QBTN_MARGIN = 5;
const QBTN_SIZE = 42;

const fabRef = useTemplateRef('fab');
const fabOpened = ref<boolean>(false);

// Computed

const fabButtonsCount = computed(() => {
  let count = 0;

  if (fabButtonsVisibility !== undefined) {
    for (const button in fabButtonsVisibility) {
      if (fabButtonsVisibility[button]) count++;
    }
  } else if (slots.default) {
    for (const item of slots.default()) {
      if (item.type !== Comment) count++;
    }
  }

  return count;
});

const showFab = computed(() => !!slots.default && fabButtonsCount.value > 0);

const offsetX = computed(() => PAGE_PADDING - (!showFab.value ? QBTN_MARGIN : 0) + (offset.x || 0));

const offsetY = computed(() => {
  const buttonSize = !showFab.value ? QBTN_SIZE : QFAB_BTN_SIZE;

  if (position.includes('top')) {
    return (
      Math.max(floatToolbarOffsetTop.value - buttonSize / 2, -(buttonSize / 2), minMarginY) +
      (offset.y || 0)
    );
  } else if (position.includes('bottom')) {
    return (
      Math.max(floatToolbarOffsetBottom.value - buttonSize / 2, -(buttonSize / 2), minMarginY) +
      (offset.y || 0)
    );
  } else {
    return 0;
  }
});

const containerMargin = computed(() => {
  const style: Record<string, unknown> = {};

  if (position.includes('top')) {
    style['margin-bottom'] = '0px';
  }
  if (position.includes('bottom')) {
    style['margin-top'] = '0px';
  }
  if (position.includes('left')) {
    style['margin-right'] = '0px';
  }
  if (position.includes('right')) {
    style['margin-left'] = '0px';
  }

  return style;
});

const direction = computed(() => {
  if (position === 'top-left' || position === 'bottom-left' || position === 'left') {
    return 'right';
  } else if (position === 'top-right' || position === 'bottom-right' || position === 'right') {
    return 'left';
  } else if (position === 'top') {
    return 'down';
  } else if (position === 'bottom') {
    return 'up';
  } else {
    const _exhaustiveCheck: never = position;
    return _exhaustiveCheck;
  }
});

const reverseOrder = computed(() => {
  if (
    position === 'top-left' ||
    position === 'bottom-left' ||
    position === 'left' ||
    position === 'top' ||
    position === 'bottom'
  ) {
    return false;
  } else if (position === 'top-right' || position === 'bottom-right' || position === 'right') {
    return true;
  } else {
    const _exhaustiveCheck: never = position;
    return _exhaustiveCheck;
  }
});

const secondRowPosition = computed(() => {
  if (
    position === 'top-left' ||
    position === 'top-right' ||
    position === 'top' ||
    position === 'left' ||
    position === 'right'
  ) {
    return 'bottom';
  } else if (position === 'bottom-left' || position === 'bottom-right' || position === 'bottom') {
    return 'top';
  } else {
    const _exhaustiveCheck: never = position;
    return _exhaustiveCheck;
  }
});

const fabContentMargin = computed(() => {
  if (
    position === 'top-left' ||
    position === 'top-right' ||
    position === 'left' ||
    position === 'right'
  ) {
    return { 'margin-top': `${buttonSpace.value}px` };
  } else if (position === 'bottom-left' || position === 'bottom-right') {
    return { 'margin-bottom': `${buttonSpace.value}px` };
  } else if (position === 'top' || position === 'bottom') {
    return {};
  } else {
    const _exhaustiveCheck: never = position;
    return _exhaustiveCheck;
  }
});

const buttonSpace = computed(() => QBTN_SIZE + QBTN_MARGIN * 2);

const fixedButtonsPosition = computed(() => {
  if (!showFab.value) {
    return 0;
  }

  if (position === 'top' || position === 'bottom') {
    return QFAB_ACTIONS_MARGIN;
  }

  return (
    (reverseOrder.value ? -1 : 1) *
    (QFAB_ACTIONS_PADDING +
      QFAB_ACTIONS_MARGIN +
      (fabOpened.value ? buttonSpace.value * (fabButtonsCount.value - fabButtonsSpaceIgnored) : 0))
  );
});

// Methods

function open() {
  fabRef.value?.show();
}

// Expose

defineExpose({
  open,
});
</script>

<template>
  <q-page-sticky
    :offset="[offsetX, offsetY]"
    :position="position"
    style="z-index: 2500"
    :style="containerMargin"
  >
    <div class="flex flex-center">
      <TransitionGroup
        v-if="reverseOrder"
        class="fixed-buttons z-top row reverse"
        name="float-toolbar-transition"
        :style="{ transform: `translateX(${fixedButtonsPosition}px)` }"
        tag="div"
      >
        <slot name="fixed-buttons"></slot>
      </TransitionGroup>

      <q-fab
        v-if="showFab"
        ref="fab"
        v-model="fabOpened"
        color="accent"
        :direction="direction"
        icon="fal fa-ellipsis-h-alt"
        :persistent="persistent"
      >
        <div style="pointer-events: none" :style="fabContentMargin">
          <TransitionGroup
            v-if="secondRowPosition === 'top'"
            class="no-wrap row children-clickable"
            :class="{ reverse: reverseOrder }"
            name="float-toolbar-transition"
            :style="{ 'min-height': `${buttonSpace}px` }"
            tag="div"
          >
            <slot name="second-row-buttons"></slot>
          </TransitionGroup>

          <TransitionGroup
            class="no-wrap row children-clickable"
            :class="{ reverse: reverseOrder }"
            name="float-toolbar-transition"
            :style="{ 'min-height': `${buttonSpace}px` }"
            tag="div"
          >
            <slot></slot>
          </TransitionGroup>

          <TransitionGroup
            v-if="secondRowPosition === 'bottom'"
            class="no-wrap row children-clickable"
            :class="{ reverse: reverseOrder }"
            name="float-toolbar-transition"
            :style="{ 'min-height': `${buttonSpace}px` }"
            tag="div"
          >
            <slot name="second-row-buttons"></slot>
          </TransitionGroup>
        </div>
      </q-fab>

      <TransitionGroup
        v-if="!reverseOrder"
        class="fixed-buttons z-top row"
        name="float-toolbar-transition"
        :style="{ transform: `translateX(${fixedButtonsPosition}px)` }"
        tag="div"
      >
        <slot name="fixed-buttons"></slot>
      </TransitionGroup>
    </div>
  </q-page-sticky>
</template>

<style lang="scss">
// Fix position of FontAwesome icon
.q-fab__icon-holder {
  width: 30px;
  margin-left: -3px;
  margin-right: -3px;
}

.fixed-buttons {
  transition: transform 0.18s ease-in;

  .q-btn {
    margin: 0 5px;
  }
}

.q-fab__actions--opened .children-clickable > * {
  pointer-events: auto;
}

.float-toolbar-transition-enter-active,
.float-toolbar-transition-leave-active {
  transition: all 0.3s;
}

.float-toolbar-transition-enter-from,
.float-toolbar-transition-leave-to {
  margin-right: -47px !important;
  opacity: 0;

  &.q-btn.disabled,
  &.disabled,
  &[disabled] {
    opacity: 0 !important;
  }
}
</style>
