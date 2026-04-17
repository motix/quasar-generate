<script setup lang="ts">
import useProjectViewPage_ProjectMessages from 'composables/finance/project/useProjectViewPage_ProjectMessages.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

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
    <q-item v-if="!slackChannel" key="loading" class="q-py-md">
      <FadeTransition>
        <div v-if="!slackChannelReady" key="loading" class="text-center full-width">
          Messages loading<br />
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <div v-else key="error" class="text-center full-width">
          <q-btn
            color="primary"
            label="Prepare Project Finance Channel"
            @click="prepareSlackChannel"
          />
        </div>
      </FadeTransition>
    </q-item>

    <q-expansion-item
      v-else
      key="ready"
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      icon="fal fa-comments"
      label="Messages"
      popup
    >
      <q-card>
        <q-markup-table>
          <tbody>
            <tr>
              <td colspan="2">
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

                ({{
                  `${slackChannel.members.length} member${
                    slackChannel.members.length > 1 ? 's' : ''
                  }`
                }})
              </td>
            </tr>

            <tr v-if="slackChannel.messages.length === 0">
              <td class="text-center" colspan="2">
                <q-btn
                  color="primary"
                  :href="`https://slack.com/archives/${slackChannel.id}`"
                  label="Chat on Slack"
                  target="_blank"
                />
              </td>
            </tr>

            <tr v-for="(message, index) in slackChannel.messages" :key="index">
              <td class="q-table--col-auto-width vertical-top" style="padding-right: 0">
                <q-avatar class="q-mt-xs" size="md">
                  <q-img :src="message.user.photoUrl" />
                </q-avatar>
              </td>
              <td class="text-wrap">
                <div>
                  <strong>
                    {{ message.user.fullName }}
                  </strong>
                  <span class="q-ml-sm text-caption">
                    {{ f.date(message.timestamp) }}
                  </span>
                </div>

                <!-- eslint-disable vue/no-v-html -->
                <div v-if="!!message.parsedText" v-html="message.parsedText"></div>
                <!-- eslint-enable vue/no-v-html -->
                <div v-else>
                  {{ message.text }}
                </div>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-expansion-item>
  </FadeTransition>
</template>
