import type { CollectionReference } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';

import { config } from 'dotenv';
import * as slack from 'slack';

import type { ProjectAm as Project } from 'models/finance/index.js';
import type { MemberAm as Member } from 'models/membership/index.js';

// `slack` is a CommonJS module
const { users, conversations } = (slack as unknown as { default: typeof slack }).default;

const configPath = './.env.local-mnapp-slack';
const env = config({ path: configPath }).parsed;

if (!env) {
  throw Error('`.env.local-mnapp-slack` not found.');
}

async function findChannel(name: string) {
  let conversationsResult = await users.conversations({
    token: process.env.SLACK_ACCESS_TOKEN,
    types: 'private_channel',
  });

  let channel = conversationsResult.channels.find((value) => value.name === name);

  while (channel === undefined && conversationsResult.response_metadata.next_cursor !== '') {
    conversationsResult = await users.conversations({
      token: process.env.SLACK_ACCESS_TOKEN,
      cursor: conversationsResult.response_metadata.next_cursor,
      types: 'private_channel',
    });

    channel = conversationsResult.channels.find((value) => value.name === name);
  }

  return channel;
}

export async function createProjectFinanceChannelIfNotExist(
  project: Project,
  inviteMembersIfExist: boolean,
) {
  const channelName = `fn__${project.urlFriendlyName}`;
  const channelTopic = `Finance comments for ${project.name}`;
  const channelDescription = `https://finance.motiteam.com/projects/${project.urlFriendlyName}`;

  let channel = await findChannel(channelName);

  if (channel) {
    await conversations.setTopic({
      token: process.env.SLACK_ACCESS_TOKEN,
      channel: channel.id,
      topic: channelTopic,
    });

    await conversations.setPurpose({
      token: process.env.SLACK_ACCESS_TOKEN,
      channel: channel.id,
      purpose: channelDescription,
    });

    inviteMembersIfExist && (await inviteFinanceChannelMembers(channel.id));

    return;
  }

  const createResult = await conversations.create({
    token: process.env.SLACK_ACCESS_TOKEN,
    name: channelName,
    is_private: true,
  });

  channel = createResult.channel;

  await conversations.setTopic({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: channel.id,
    topic: channelTopic,
  });

  await conversations.setPurpose({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: channel.id,
    purpose: channelDescription,
  });

  await inviteFinanceChannelMembers(channel.id);
}

export async function inviteFinanceChannelMembers(channelId: string) {
  const db = getFirestore();
  const membersRef = db.collection('admin_members') as CollectionReference<Member>;
  const membersSnapshot = await membersRef.get();
  const usersToInvite = membersSnapshot.docs
    .filter((value) => value.data().inviteToFinanceChannels && !!value.data().slackId)
    .map((value) => value.data().slackId!);

  const membersResult = await conversations.members({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: channelId,
  });

  for (const userToInvite of usersToInvite) {
    if (membersResult.members.indexOf(userToInvite) === -1) {
      await conversations.invite({
        token: process.env.SLACK_ACCESS_TOKEN,
        channel: channelId,
        users: userToInvite,
      });
    }
  }
}

export async function updateProjectFinanceChannel(oldProject: Project, newProject: Project) {
  const oldChannelName = `fn__${oldProject.urlFriendlyName}`;
  const newChannelName = `fn__${newProject.urlFriendlyName}`;
  const newChannelTopic = `Finance comments for ${newProject.name}`;
  const newChannelDescription = `https://finance.motiteam.com/projects/${newProject.urlFriendlyName}`;

  const channel = await findChannel(oldChannelName);

  if (channel) {
    await conversations.rename({
      token: process.env.SLACK_ACCESS_TOKEN,
      channel: channel.id,
      name: newChannelName,
    });

    await conversations.setTopic({
      token: process.env.SLACK_ACCESS_TOKEN,
      channel: channel.id,
      topic: newChannelTopic,
    });

    await conversations.setPurpose({
      token: process.env.SLACK_ACCESS_TOKEN,
      channel: channel.id,
      purpose: newChannelDescription,
    });
  }
}
