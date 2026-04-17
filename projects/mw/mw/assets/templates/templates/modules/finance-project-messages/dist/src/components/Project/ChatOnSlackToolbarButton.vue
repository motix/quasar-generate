<script setup lang="ts">
import { watchEffect } from 'vue';

import { Dark } from 'quasar';

import useProjectViewPage_ProjectMessages from 'composables/finance/project/useProjectViewPage_ProjectMessages.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useProjectViewPage_ProjectMessages(props.scopeName);
const {
  // Auto sort
  showChatOnSlack,
  slackChannel,
} = $p;

// Watch

watchEffect(() => {
  $p.toolbarSecondRowButtonVisibility.value.chatOnSlack = $p.showChatOnSlack.value;
});
</script>

<template>
  <q-btn
    v-show="showChatOnSlack"
    key="chatOnSlack"
    class="shadow-2"
    :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
    :href="`https://slack.com/archives/${slackChannel?.id}`"
    icon="fal fa-comment-plus"
    outline
    padding="sm"
    target="_blank"
    text-color="primary"
  >
    <TopTooltip>Chat on Slack</TopTooltip>
  </q-btn>
</template>
