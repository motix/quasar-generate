<script setup lang="ts">
import { computed, readonly, ref, toRefs } from 'vue';

import { Dark } from 'quasar';

import { requiredConfigEntries } from 'composables/useConfig.js';

import ExpandableCardHeader from './ExpandableCardHeader.vue';

// Props

const props = withDefaults(
  defineProps<{
    expandable?: boolean | undefined;
    initiallyExpanded?: boolean | undefined;
    clickable?: boolean | undefined;
    headerBackgroundColor?: string | undefined;
    bodyBackgroundColor?: string | undefined;
    headerDark?: boolean | undefined;
    externalLinkUrl?: string | undefined;
    externalLinkTooltip?: string | undefined;
    avatarTop?: boolean | undefined;
    avatarColor?: string | undefined;
    avatarSize?: string | undefined;
    avatarIcon?: string | undefined;
    avatarImage?: string | undefined;
    useGravatar?: boolean | undefined;
    gravatarId?: string | undefined;
    titleFullWidth?: boolean | undefined;
    titleTop?: boolean | undefined;
    titleColor?: string | undefined;
    titleNoWrap?: boolean | undefined;
    title?: string | undefined;
    titleEndIconColor?: string | undefined;
    titleEndIconSuperscript?: boolean | undefined;
    titleEndIcon?: string | undefined;
    subtitleIcon?: string | undefined;
    subtitleColor?: string | undefined;
    subtitle?: string | undefined;
    subtitleTooltip?: string | undefined;
    captionColor?: string | undefined;
    caption?: string | undefined;
    captionTooltip?: string | undefined;
    sideTop?: boolean | undefined;
    headerSeparator?: boolean | undefined;
    bodyLoading?: boolean | undefined;
    bodyClass?: string | undefined;
    bodyColGutter?: boolean | undefined;
    bodyRowGutter?: boolean | undefined;
    bodyCellGutter?: boolean | undefined;
    bezelLessLoading?: boolean | undefined;
  }>(),
  {
    expandable: false,
    initiallyExpanded: false,
    clickable: false,
    headerBackgroundColor: undefined,
    bodyBackgroundColor: undefined,
    headerDark: false,
    externalLinkUrl: undefined,
    externalLinkTooltip: undefined,
    avatarTop: false,
    avatarColor: undefined,
    avatarSize: '56px',
    avatarIcon: undefined,
    avatarImage: undefined,
    useGravatar: false,
    gravatarId: undefined,
    titleFullWidth: false,
    titleTop: false,
    titleColor: undefined,
    titleNoWrap: false,
    title: undefined,
    titleEndIconColor: undefined,
    titleEndIconSuperscript: false,
    titleEndIcon: undefined,
    subtitleIcon: undefined,
    subtitleColor: undefined,
    subtitle: undefined,
    subtitleTooltip: undefined,
    captionColor: undefined,
    caption: undefined,
    captionTooltip: undefined,
    sideTop: false,
    headerSeparator: false,
    bodyLoading: false,
    bodyClass: undefined,
    bodyColGutter: false,
    bodyRowGutter: false,
    bodyCellGutter: false,
    bezelLessLoading: false,
  },
);

const {
  expandable,
  initiallyExpanded,
  clickable,
  headerBackgroundColor,
  bodyBackgroundColor,
  headerDark,
  headerSeparator,
  bodyLoading,
  bodyClass,
  bodyColGutter,
  bodyRowGutter,
  bodyCellGutter,
  bezelLessLoading,
} = toRefs(props);

// Data

const cardWidth = readonly(ref(requiredConfigEntries('cardWidth').cardWidth));

const cardExpanded = ref(initiallyExpanded.value);

// Computed

const bodyCssClass = computed<Record<string, unknown>>(() => {
  const result: Record<string, unknown> = {
    'q-col-gutter-x-md row': bodyColGutter.value,
    'q-gutter-y-md': bodyRowGutter.value,
    'q-col-gutter-md row': bodyCellGutter.value,
  };

  if (bodyClass.value !== undefined) {
    result[bodyClass.value] = true;
  }

  return result;
});

const expanded = computed(() => expandable.value && cardExpanded.value);

// Expose

defineExpose({
  expanded,
});
</script>

<template>
  <q-card
    :class="`bg-${bodyBackgroundColor !== undefined ? bodyBackgroundColor : Dark.isActive ? 'grey-10' : 'grey-1'}`"
    style="width: 100%"
    :style="{ maxWidth: cardWidth + 'px' }"
  >
    <template v-if="expandable">
      <q-expansion-item
        v-model="cardExpanded"
        :class="
          (headerBackgroundColor !== undefined ? `bg-${headerBackgroundColor}` : '') +
          ' ' +
          (clickable ? 'cursor-pointer' : '')
        "
        :dark="headerDark || Dark.isActive"
        expand-icon-class="q-pr-none"
        :expand-icon-toggle="clickable"
        expand-separator
        @click.stop
      >
        <template #header>
          <ExpandableCardHeader v-bind="$props" class="q-pl-none full-width" :clickable="false">
            <template v-if="$slots.main" #main>
              <slot name="main"></slot>
            </template>

            <template v-if="$slots.side" #side>
              <slot name="side"></slot>
            </template>
          </ExpandableCardHeader>
        </template>

        <div
          class="rounded-borders"
          :class="`bg-${bodyBackgroundColor !== undefined ? bodyBackgroundColor : Dark.isActive ? 'grey-10' : 'grey-1'}`"
          style="border-top-left-radius: 0; border-top-right-radius: 0; cursor: default"
          @click.stop
        >
          <!-- Fix background error when the following templates use q-gutter classes -->
          <div style="height: 1px"></div>

          <slot name="bezel-less-top"></slot>

          <q-linear-progress v-if="bodyLoading" color="warning" indeterminate />
          <q-slide-transition>
            <q-card-section v-if="$slots.body" v-show="!bodyLoading" :class="bodyCssClass">
              <slot name="body"></slot>
            </q-card-section>
          </q-slide-transition>

          <q-linear-progress v-if="bezelLessLoading" color="warning" indeterminate />
          <q-slide-transition>
            <div v-if="$slots['bezel-less']" v-show="!bezelLessLoading">
              <slot name="bezel-less"></slot>
            </div>
          </q-slide-transition>
        </div>
      </q-expansion-item>
    </template>

    <template v-else>
      <ExpandableCardHeader
        v-ripple="clickable"
        v-bind="$props"
        class="q-pa-md"
        :class="headerBackgroundColor !== undefined ? `bg-${headerBackgroundColor}` : ''"
      >
        <template v-if="$slots.main" #main>
          <slot name="main"></slot>
        </template>

        <template v-if="$slots.side" #side>
          <slot name="side"></slot>
        </template>
      </ExpandableCardHeader>

      <div @click.stop>
        <q-separator v-if="headerSeparator" />

        <slot name="bezel-less-top"></slot>

        <q-linear-progress v-if="bodyLoading" color="warning" indeterminate />
        <q-slide-transition>
          <q-card-section v-if="$slots.body" v-show="!bodyLoading" :class="bodyCssClass">
            <slot name="body"></slot>
          </q-card-section>
        </q-slide-transition>

        <q-linear-progress v-if="bezelLessLoading" color="warning" indeterminate />
        <q-slide-transition>
          <div v-if="$slots['bezel-less']" v-show="!bezelLessLoading">
            <slot name="bezel-less"></slot>
          </div>
        </q-slide-transition>
      </div>
    </template>
  </q-card>
</template>

<style lang="scss" scoped>
// Fix focus error when the following templates use q-gutter classes
:deep() .q-expansion-item > .q-expansion-item__container > .q-hoverable {
  z-index: 1;
}
</style>
