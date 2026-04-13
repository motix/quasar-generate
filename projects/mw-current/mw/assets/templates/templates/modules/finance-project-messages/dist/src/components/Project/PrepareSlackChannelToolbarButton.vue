<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { faComments } from '@fortawesome/pro-light-svg-icons';
import { faSync } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

import { watchEffect } from 'vue';

import { Dark } from 'quasar';

import useProjectViewPage_ProjectMessages from 'composables/finance/project/useProjectViewPage_ProjectMessages.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useProjectViewPage_ProjectMessages(props.scopeName);
const {
  // Auto sort
  freezed,
  prepareSlackChannel,
  preparingSlackChannel,
  showPrepareSlackChannel,
} = $p;

// Private Executions

library.add(faComments, faSync);

// Watch

watchEffect(() => {
  $p.toolbarSecondRowButtonVisibility.value.prepareSlackChannel = $p.showPrepareSlackChannel.value;
});
</script>

<template>
  <q-btn
    v-show="showPrepareSlackChannel"
    key="prepareSlackChannel"
    class="shadow-2"
    :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
    :disable="freezed"
    :loading="preparingSlackChannel"
    outline
    padding="sm"
    text-color="primary"
    @click="prepareSlackChannel"
  >
    <FontAwesomeLayers class="fa-lg" fixed-width style="margin-left: 1px; margin-right: 1px">
      <FontAwesomeIcon :icon="['fal', 'comments']" size="lg" />
      <FontAwesomeIcon :icon="['fas', 'sync']" size="lg" transform="shrink-10 up-8 left-9" />
    </FontAwesomeLayers>
    <TopTooltip>Prepare Project Finance Channel</TopTooltip>
  </q-btn>
</template>
