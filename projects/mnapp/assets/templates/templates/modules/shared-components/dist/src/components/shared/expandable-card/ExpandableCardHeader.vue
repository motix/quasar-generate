<script setup lang="ts">
import { computed } from 'vue';

import { Dark } from 'quasar';

// Props

const {
  expandable = false,
  headerBackgroundColor = undefined,
  headerDark = false,
  externalLinkUrl = undefined,
  externalLinkTooltip = undefined,
  avatarTop = false,
  avatarColor = undefined,
  avatarSize = '56px',
  avatarIcon = undefined,
  avatarImage = undefined,
  useGravatar = false,
  gravatarId = undefined,
  titleFullWidth = false,
  titleTop = false,
  titleColor = undefined,
  titleNoWrap = false,
  title = undefined,
  titleEndIconColor = undefined,
  titleEndIconSuperscript = false,
  titleEndIcon = undefined,
  subtitleIcon = undefined,
  subtitleColor = undefined,
  subtitle = undefined,
  subtitleTooltip = undefined,
  captionColor = undefined,
  caption = undefined,
  captionTooltip = undefined,
  sideTop = false,
} = defineProps<{
  expandable?: boolean | undefined;
  headerBackgroundColor?: string | undefined;
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
}>();

// Computed

const titleCssClass = computed(() => {
  const val: { [key: string]: boolean } = {
    'text-no-wrap': titleNoWrap,
  };

  if (titleColor !== undefined) {
    val[`text-${titleColor}`] = true;
  }

  return val;
});

const subtitleCssClass = computed(() => {
  const val: { [key: string]: boolean } = {};

  if (subtitleColor !== undefined) {
    val[`text-${subtitleColor}`] = true;
  }

  return val;
});

const captionCssClass = computed(() => {
  const val: { [key: string]: boolean } = {};

  if (captionColor !== undefined) {
    val[`text-${captionColor}`] = true;
  }

  return val;
});
</script>

<template>
  <q-item :dark="headerDark || Dark.isActive">
    <q-btn
      v-if="externalLinkUrl !== undefined"
      class="absolute"
      :color="headerDark ? 'white' : 'primary'"
      flat
      :href="externalLinkUrl"
      icon="fal fa-external-link"
      outline
      padding="xs"
      size="xs"
      :style="{
        right: expandable ? '-39px' : '0px',
        top: expandable ? '-8px' : '0px',
      }"
      target="_blank"
      type="a"
      @click.stop
    >
      <top-tooltip v-if="externalLinkTooltip">{{ externalLinkTooltip }}</top-tooltip>
    </q-btn>

    <q-item-section
      v-if="avatarIcon !== undefined || avatarImage !== undefined || useGravatar"
      avatar
      :class="{ 'q-pt-xs': avatarTop }"
      :top="avatarTop"
    >
      <q-avatar
        v-if="avatarIcon !== undefined"
        :color="
          avatarColor !== undefined ? avatarColor : headerDark || Dark.isActive ? 'white' : 'grey-9'
        "
        :size="avatarSize"
      >
        <q-icon
          :color="
            headerBackgroundColor !== undefined
              ? headerBackgroundColor
              : headerDark || Dark.isActive
                ? 'grey-9'
                : 'white'
          "
          :name="avatarIcon"
        />
      </q-avatar>
      <q-avatar v-if="avatarImage !== undefined" :size="avatarSize">
        <q-img :src="avatarImage" />
      </q-avatar>
      <GravatarImage
        v-if="useGravatar"
        :dark="headerDark || Dark.isActive"
        :gravatar-id="gravatarId"
      />
    </q-item-section>

    <q-item-section :top="titleTop">
      <q-item-label v-if="title !== undefined" class="text-h6" :class="titleCssClass">
        {{ title }}
        <template v-if="titleEndIcon !== undefined">
          <sup v-if="titleEndIconSuperscript">
            <q-icon :color="titleEndIconColor" :name="titleEndIcon" />
          </sup>
          <q-icon v-else class="q-ml-xs" :color="titleEndIconColor" :name="titleEndIcon" />
        </template>
      </q-item-label>

      <!-- Setting max-width to support ellipsis in main slot -->
      <q-item class="q-pa-none" style="max-width: 100%; min-height: 0">
        <q-item-section top>
          <q-item-label
            v-if="subtitle !== undefined"
            class="text-subtitle2 q-pt-xs"
            :class="subtitleCssClass"
          >
            <q-icon v-if="subtitleIcon !== undefined" class="q-mr-xs" :name="subtitleIcon" />
            <span>
              {{ subtitle }}
              <TopTooltip v-if="subtitleTooltip !== undefined">
                {{ subtitleTooltip }}
              </TopTooltip>
            </span>
          </q-item-label>

          <q-item-label v-if="caption !== undefined" caption :class="captionCssClass">
            <span>
              {{ caption }}
              <TopTooltip v-if="captionTooltip !== undefined">
                {{ captionTooltip }}
              </TopTooltip>
            </span>
          </q-item-label>

          <!-- Use a div to prevent content from spreading to full width -->
          <div style="max-width: 100%">
            <slot name="main"></slot>
          </div>
        </q-item-section>

        <q-item-section v-if="$slots.side && titleFullWidth" class="text-right" side :top="sideTop">
          <slot name="side"></slot>
        </q-item-section>
      </q-item>
    </q-item-section>

    <q-item-section
      v-if="$slots.side && !titleFullWidth"
      class="text-right"
      :class="{ 'q-pt-xs': sideTop }"
      side
      :top="sideTop"
    >
      <slot name="side"></slot>
    </q-item-section>
  </q-item>
</template>
