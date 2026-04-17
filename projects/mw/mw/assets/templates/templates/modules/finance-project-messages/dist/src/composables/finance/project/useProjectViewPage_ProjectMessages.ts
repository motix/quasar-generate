import type { Ref } from 'vue';
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue';

import { Notify } from 'quasar';

import { isEqual } from 'lodash-es';

import type { SlackMessage, SlackUser } from 'models/slack';

import { prepareProjectFinanceChannel } from 'services/finance/projects.js';
import { loadPrivateChannel } from 'services/slack/index.js';

import useProjectViewPage from 'composables/finance/project/useProjectViewPage.js';
import useNotifications from 'composables/useNotifications.js';

type TViewPage = ReturnType<typeof useProjectViewPage>;

function useMessagesExtra($p: TViewPage) {
  // Private

  let loadMessagesIntervalId: ReturnType<typeof setInterval> | null = null;

  async function loadMessages() {
    try {
      const result = await loadPrivateChannel(
        `fn__${$p.m.value.urlFriendlyName}`,
        ...$p.m.value.rawSlackMessages,
      );

      slackChannel.value = result
        ? {
            id: result.channelId,
            members: result.users,
            messages: result.messages,
          }
        : result;

      slackChannelReady.value = true;

      if (!result || isEqual(result.rawMessages, $p.m.value.rawSlackMessages)) {
        return;
      }

      $p.m.value.rawSlackMessages = result.rawMessages;
      await $p.viewerSave();
    } catch (error) {
      loadMessagesIntervalId && clearInterval(loadMessagesIntervalId);
      loadMessagesIntervalId = null;

      console.error(error);
      notifyLoadDataError();
      notifyErrorDebug(error);
      slackChannelReady.value = true;
    }
  }

  // Composables

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  // Data

  const slackChannelReady = ref(false);
  const slackChannel = ref(null) as Ref<{
    id: string;
    members: SlackUser[];
    messages: SlackMessage[];
  } | null>;
  const preparingSlackChannel = ref(false);

  // Computed

  const showChatOnSlack = computed(() => !$p.editMode.value && !!slackChannel.value);
  const showPrepareSlackChannel = computed(
    () => $p.ready.value && !!$p.model.value && !$p.editMode.value,
  );

  // Methods

  async function prepareSlackChannel() {
    $p.freezed.value = true;
    preparingSlackChannel.value = true;

    loadMessagesIntervalId && clearInterval(loadMessagesIntervalId);
    loadMessagesIntervalId = null;

    if (!slackChannel.value) {
      slackChannelReady.value = false;
    }

    try {
      await prepareProjectFinanceChannel($p.m.value.id);
    } catch {
      Notify.create({
        message:
          'Prepare Project finance channel error. Refresh the page to try again or contact support.',
        type: 'negative',
      });
    }

    Notify.create({
      message: 'Project finance channel prepared successfully.',
      type: 'positive',
    });

    preparingSlackChannel.value = false;
    $p.freezed.value = false;

    slackChannelReady.value = false;
    slackChannel.value = null;

    await loadMessages();
    loadMessagesIntervalId = setInterval(() => void loadMessages(), 5000);
  }

  // Lifecycle Hooks

  onUnmounted(() => {
    loadMessagesIntervalId && clearInterval(loadMessagesIntervalId);
    loadMessagesIntervalId = null;
  });

  // Watch

  watch(
    computed(() => $p.model.value?.urlFriendlyName),
    async () => {
      loadMessagesIntervalId && clearInterval(loadMessagesIntervalId);
      loadMessagesIntervalId = null;

      slackChannelReady.value = false;
      slackChannel.value = null;

      if (!$p.model.value) {
        return;
      }

      await loadMessages();
      loadMessagesIntervalId = setInterval(() => void loadMessages(), 5000);
    },
  );

  watchEffect(() => {
    $p.collectionsHaveItems.value.slackChannel = !$p.editMode.value && !!slackChannel.value;
  });

  return {
    slackChannelReady,
    slackChannel,
    preparingSlackChannel,
    showChatOnSlack,
    showPrepareSlackChannel,
    prepareSlackChannel,
  };
}

export function extendProjectViewPage_ProjectMessages($p: TViewPage) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useProjectViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useMessagesExtra>;

  Object.assign(extension, useMessagesExtra($p));
  Object.assign($p, extension);

  return extension;
}

export default function useProjectViewPage_ProjectMessages(scopeName: string) {
  const $p = useProjectViewPage(scopeName);

  return $p as typeof $p & ReturnType<typeof extendProjectViewPage_ProjectMessages>;
}
