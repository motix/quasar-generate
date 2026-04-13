<script setup lang="ts">
import { Dark } from 'quasar';

import useProjectViewPage_ProjectMessages from 'composables/finance/project/useProjectViewPage_ProjectMessages.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth, listItemCardWidth } = requiredConfigEntries('cardWidth', 'listItemCardWidth');

const {
  // Auto sort
  f,
  prepareSlackChannel,
  slackChannel,
  slackChannelReady,
} = useProjectViewPage_ProjectMessages(props.scopeName);
</script>

<template>
  <FadeTransition>
    <div v-if="!slackChannel" key="loading">
      <FadeTransition>
        <div v-if="!slackChannelReady" key="loading" class="text-center">
          Messages loading<br />
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <div v-else key="error" class="text-center">
          <q-btn
            color="primary"
            label="Prepare Project Finance Channel"
            @click="prepareSlackChannel"
          />
        </div>
      </FadeTransition>
    </div>

    <div v-else key="ready" class="q-gutter-y-md">
      <q-card
        class="q-mx-auto bg-accent"
        :class="Dark.isActive ? undefined : 'shadow-2'"
        dark
        style="width: 100%"
        :style="{ maxWidth: cardWidth + 'px' }"
      >
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-center">Messages</div>
        </q-card-section>

        <q-card-section>
          <div class="row justify-between">
            <div>Members</div>
            <div class="text-warning">
              {{ slackChannel.members.length }}
            </div>
          </div>
        </q-card-section>

        <q-card-section :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1 text-dark'">
          <template v-for="(user, index) in slackChannel.members" :key="user.id">
            <q-btn
              class="q-pa-none"
              color="primary"
              flat
              :href="`https://slack.com/team/${user.id}`"
              no-caps
              style="min-height: 0"
              target="_blank"
            >
              @{{ user.fullName }} </q-btn
            ><template v-if="index < slackChannel.members.length - 1">, </template>
          </template>
        </q-card-section>
      </q-card>

      <!-- Bottom padding to be consistent with editor -->
      <div class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs">
        <q-btn
          v-if="slackChannel.messages.length === 0"
          color="primary"
          :href="`https://slack.com/archives/${slackChannel.id}`"
          label="Chat on Slack"
          target="_blank"
        />

        <ExpandableCard
          v-for="(message, index) in slackChannel.messages"
          :key="index"
          :avatar-image="message.user.photoUrl"
          avatar-size=""
          :caption="f.date(message.timestamp) || undefined"
          header-background-color="primary"
          header-dark
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :title="message.user.fullName"
        >
          <template #body>
            <!-- eslint-disable vue/no-v-html -->
            <div v-if="!!message.parsedText" v-html="message.parsedText"></div>
            <!-- eslint-enable vue/no-v-html -->
            <div v-else>
              {{ message.text }}
            </div>
          </template>
        </ExpandableCard>
      </div>
    </div>
  </FadeTransition>
</template>
