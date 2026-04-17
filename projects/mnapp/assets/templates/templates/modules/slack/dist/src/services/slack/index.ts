import emojiData from './emoji.json' with { type: 'json' };

import { date } from 'quasar';

import { isEqual, sortBy, uniqWith } from 'lodash-es';
import slack from 'slack';
import type { Node } from 'slack-message-parser';
import parse, { NodeType } from 'slack-message-parser';

import type { SlackMessage, SlackUser } from 'models/slack/index.js';

async function findChannel(name: string) {
  let conversationsResult = await slack.users.conversations({
    token: process.env.SLACK_ACCESS_TOKEN,
    types: 'private_channel',
  });

  let channel = conversationsResult.channels.find((value) => value.name === name);

  while (channel === undefined && conversationsResult.response_metadata.next_cursor !== '') {
    conversationsResult = await slack.users.conversations({
      token: process.env.SLACK_ACCESS_TOKEN,
      cursor: conversationsResult.response_metadata.next_cursor,
      types: 'private_channel',
    });

    channel = conversationsResult.channels.find((value) => value.name === name);
  }

  return channel;
}

export async function loadUsers() {
  const listResult = await slack.users.list({
    token: process.env.SLACK_ACCESS_TOKEN,
  });

  const users: SlackUser[] = listResult.members.map((value) => ({
    id: value.id,
    email: value.profile.email,
    fullName: value.real_name,
    photoUrl: value.profile.image_192,
  }));

  return users;
}

export async function loadPrivateChannel(channelName: string, ...savedMessages: Message[]) {
  const channel = await findChannel(channelName);

  if (!channel) {
    return null;
  }

  const historyResult = await slack.conversations.history({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: channel.id,
  });

  savedMessages = savedMessages.filter(
    (savedMessage) =>
      historyResult.messages.some((value) => isEqual(value, savedMessage)) ||
      date.getDateDiff(new Date(), new Date(Number(savedMessage.ts) * 1000), 'days') > 30,
  );

  let rawMessages = [...savedMessages, ...historyResult.messages];

  rawMessages = uniqWith(
    rawMessages,
    (a, b) => b.text === a.text && b.ts === a.ts && b.user === a.user,
  );

  rawMessages = sortBy(rawMessages, (value) => -Number(value.ts));

  const { users, messages } = await processRawMessages(rawMessages);

  return {
    channelId: channel.id,
    users,
    messages,
    rawMessages,
  };
}

export async function processRawMessages(rawMessages: Message[]) {
  const userIds = [...new Set(rawMessages.map((value) => value.user))];

  const infoResults = await Promise.all(
    userIds.map((value) =>
      slack.users.info({
        token: process.env.SLACK_ACCESS_TOKEN,
        user: value,
      }),
    ),
  );

  let users: SlackUser[] = infoResults.map((value) => ({
    id: value.user.id,
    email: value.user.profile.email,
    fullName: value.user.real_name,
    photoUrl: value.user.profile.image_192,
  }));

  users = sortBy(users, (value) => value.fullName);

  const usersMap = Object.fromEntries(users.map((value) => [value.id, value]));

  const messages: SlackMessage[] = rawMessages
    .filter(
      (value) =>
        !value.text.endsWith('has joined the channel') &&
        !value.text.endsWith('has left the channel') &&
        !value.text.startsWith('set the channel topic') &&
        !value.text.startsWith('set the channel description') &&
        !value.text.startsWith('has renamed the channel from'),
    )
    .map((value) => ({
      timestamp: new Date(Number(value.ts) * 1000),
      user:
        usersMap[value.user] ||
        (() => {
          throw new Error(`[mnapp-slack] User '${value.user}' not found.`);
        })(),
      text: value.text,
    }))
    .reverse();

  await Promise.all(
    messages.map(async (value) => {
      value.parsedText = await parseMessage(value.text);
    }),
  );

  return {
    users,
    messages,
  };
}

export async function parseMessage(message: string) {
  const hyperLink = (url: string, label: string) =>
    `<a class="q-btn q-btn--flat text-primary q-btn--actionable q-hoverable q-btn--no-uppercase q-pa-none" href="${url}" style="min-height: 0px; max-width: 100%;" target="_blank"><span class="q-focus-helper"></span><span>${label}</span></a>`;

  const stringifyNode = async (node: Node): Promise<string> => {
    switch (node.type) {
      case NodeType.Text:
        return node.text;

      case NodeType.ChannelLink:
        return hyperLink(
          `https://slack.com/archives/${node.channelID}`,
          node.label ? (await Promise.all(node.label.map(stringifyNode))).join('') : node.channelID,
        );

      case NodeType.UserLink: {
        let label = node.label
          ? (await Promise.all(node.label.map(stringifyNode))).join('')
          : undefined;

        if (!label) {
          const infoResult = await slack.users.info({
            token: process.env.SLACK_ACCESS_TOKEN,
            user: node.userID,
          });

          label = infoResult.user.real_name;
        }

        return hyperLink(`https://slack.com/team/${node.userID}`, `@${label}`);
      }

      case NodeType.URL:
        return hyperLink(
          node.url,
          node.label ? (await Promise.all(node.label.map(stringifyNode))).join('') : node.url,
        );

      case NodeType.Emoji: {
        const data = emojiData.find((value) => value.short_name === node.name);

        if (!data) {
          return node.source;
        }

        let variation = node.variation?.substring('skin-tone-'.length);

        if (!!variation && data.skin_variations) {
          variation = variation
            .replace('2', '1F3FB')
            .replace('3', '1F3FC')
            .replace('4', '1F3FD')
            .replace('5', '1F3FE')
            .replace('6', '1F3FF');

          const unified = (data.skin_variations[variation as '1F3FB'] || data).unified;

          return unified
            .split('-')
            .map((value) => `&#x${value};`)
            .join('');
        }

        return `&#x${data.unified};`;
      }

      case NodeType.Bold:
        return `<strong>${(await Promise.all(node.children.map(stringifyNode))).join('')}</strong>`;

      case NodeType.Italic:
        return `<i>${(await Promise.all(node.children.map(stringifyNode))).join('')}</i>`;

      case NodeType.Strike:
        return `<del>${(await Promise.all(node.children.map(stringifyNode))).join('')}</del>`;

      case NodeType.Root:
        return (await Promise.all(node.children.map(stringifyNode))).join('');

      default:
        return node.source;
    }
  };

  return stringifyNode(parse(message));
}
