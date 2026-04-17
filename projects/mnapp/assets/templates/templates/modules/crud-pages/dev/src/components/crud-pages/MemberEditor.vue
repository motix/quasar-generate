<script setup lang="ts">
import { markRaw } from 'vue';

import { object } from 'yup';

import { emailRequired, stringRequired } from 'utils/validation.js';

import type { Member, MemberVm } from 'models/crud-pages/index.js';

import { validateUniqueField } from 'services/firebase-firestore/validation.js';

import useEditPage from 'composables/crud-pages/useEditPage.js';

// Private

const validationSchema = markRaw(
  object({
    uid: stringRequired('UID')
      .when({
        is: (val: unknown) => !!val,
        then: (schema) => schema.min(28).max(28),
      })
      .test({
        message: 'UID is already taken',
        test: async (value) =>
          !value || (await validateUniqueField('admin_members', 'uid', value, vm.value.id)),
      }),
    email: emailRequired('Email').test({
      message: 'Email is already taken',
      test: async (value) =>
        !value || (await validateUniqueField('admin_members', 'email', value, vm.value.id)),
    }),
    fullName: stringRequired('Full Name'),
    photoUrl: stringRequired('Photo URL'),
  }),
);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useEditPage<Member, MemberVm>(props.scopeName);
const {
  // Auto sort
  dirty,
  vm,
} = $p;

// Private Executions
$p.useValidation(validationSchema, 'uid', 'email', 'fullName', 'photoUrl');
</script>

<template>
  <ExpandableCard
    :avatar-icon="vm.photoUrl ? undefined : 'fas fa-user-alt'"
    :avatar-image="vm.photoUrl || undefined"
    body-row-gutter
    :caption="vm.email || '[Email]'"
    class="q-mx-auto"
    header-background-color="primary"
    header-dark
    :subtitle="vm.uid || '[UID]'"
    subtitle-tooltip="UID"
    :title="vm.fullName || '[Full Name]'"
  >
    <template #main>
      <div class="q-mt-sm text-caption">
        Slack ID: {{ vm.slackId || '[Slack ID]' }}
        <TopTooltip>Slack ID</TopTooltip>
      </div>
    </template>

    <template #side>
      <q-toggle
        v-model="vm.isActive"
        checked-icon="fal fa-power-off"
        class="right-toggle"
        color="white"
        icon-color="primary"
        label="Active"
        left-label
        unchecked-icon="clear"
        @update:model-value="dirty"
      />

      <q-toggle
        v-model="vm.inviteToFinanceChannels"
        checked-icon="fal fa-comments"
        class="right-toggle"
        color="white"
        icon-color="primary"
        label="Finance Channels"
        left-label
        unchecked-icon="clear"
        @update:model-value="dirty"
      />
    </template>

    <template #body>
      <QInputVal
        v-model="vm.uid"
        class="col-12"
        label="UID"
        name="uid"
        @update:model-value="dirty"
      />

      <QInputVal
        v-model="vm.email"
        class="col-12"
        label="Email"
        name="email"
        type="email"
        @update:model-value="dirty"
      />

      <QInputVal
        v-model="vm.fullName"
        class="col-12"
        label="Full Name"
        name="fullName"
        @update:model-value="dirty"
      />

      <QInputVal
        v-model="vm.photoUrl"
        class="col-12"
        label="Photo URL"
        name="photoUrl"
        @update:model-value="dirty"
      />

      <q-input
        v-model="vm.slackId"
        class="col-12"
        clearable
        hint="(optional)"
        label="Slack ID"
        @update:model-value="dirty"
      />
    </template>
  </ExpandableCard>
</template>
