<script setup lang="ts">
import { nextTick } from 'vue';

// Props

const {
  gutter = 0,
  colorEffect = false,
  noTag = false,
} = defineProps<{
  gutter?: number | undefined;
  colorEffect?: boolean | undefined;
  noTag?: boolean | undefined;
}>();

// Methods

function beforeEnter(el: Element) {
  const style = (el as HTMLElement).style;
  style.transition = 'opacity 0.5s, transform 0.5s, background-color 0.5s, margin-bottom 0s';
}

function enter(el: Element) {
  const style = (el as HTMLElement).style;
  style.marginBottom = `-${el.clientHeight + gutter}px`;
  void nextTick(() => {
    style.transition = 'opacity 0.5s, transform 0.5s, background-color 0.5s, margin-bottom 0.5s';
    style.marginBottom = '0';
  });
}

function doneEnter(el: Element) {
  const style = (el as HTMLElement).style;
  style.marginBottom = '';
  style.transition = '';
}

function leave(el: Element) {
  const style = (el as HTMLElement).style;
  style.marginTop = `-${el.clientHeight + gutter}px`;
}

function doneLeave(el: Element) {
  const style = (el as HTMLElement).style;
  style.marginTop = '';
}
</script>

<template>
  <TransitionGroup
    v-if="noTag"
    name="list-transition"
    @after-enter="doneEnter"
    @after-leave="doneLeave"
    @before-enter="beforeEnter"
    @enter="enter"
    @enter-cancelled="doneEnter"
    @leave="leave"
    @leave-cancelled="doneLeave"
  >
    <slot></slot>
  </TransitionGroup>
  <TransitionGroup
    v-else
    class="overflow-hidden"
    :class="{ 'color-effect': colorEffect }"
    name="list-transition"
    tag="div"
    @after-enter="doneEnter"
    @after-leave="doneLeave"
    @before-enter="beforeEnter"
    @enter="enter"
    @enter-cancelled="doneEnter"
    @leave="leave"
    @leave-cancelled="doneLeave"
  >
    <slot></slot>
  </TransitionGroup>
</template>

<style lang="scss">
.list-transition-leave-active {
  transition: all 0.5s;
}

.list-transition-enter-from,
.list-transition-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.color-effect > .list-transition-enter-from {
  background-color: $primary !important;
}

.color-effect > .list-transition-leave-to {
  background-color: $negative !important;
}
</style>
