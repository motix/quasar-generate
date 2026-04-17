<script setup lang="ts">
import type { Member, MemberVm } from 'models/membership/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';

import UserAccount from 'components/UserAccount/UserAccount.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  freezed,
  m,
} = useViewPage<Member, MemberVm>(props.scopeName);
</script>

<template>
  <ExpandableCard
    :avatar-icon="m.photoUrl ? undefined : 'fas fa-user-alt'"
    :avatar-image="m.photoUrl || undefined"
    :caption="m.email"
    class="q-mx-auto"
    header-separator
    :subtitle="m.uid"
    subtitle-tooltip="UID"
    :title="m.fullName"
  >
    <template v-if="!!m.slackId" #main>
      <div class="q-mt-sm text-caption">
        Slack ID: {{ m.slackId }}
        <TopTooltip>Slack ID</TopTooltip>
      </div>
    </template>

    <template #side>
      <q-toggle
        v-model="m.isActive"
        checked-icon="fal fa-power-off"
        class="right-toggle"
        color="primary"
        :disable="freezed"
        label="Active"
        left-label
        unchecked-icon="clear"
      />

      <q-toggle
        v-model="m.inviteToFinanceChannels"
        checked-icon="fal fa-comments"
        class="right-toggle"
        color="primary"
        :disable="freezed"
        label="Finance Channels"
        left-label
        unchecked-icon="clear"
      />
    </template>

    <template #body>
      <UserAccount :uid="m.uid" />
    </template>
  </ExpandableCard>
</template>
