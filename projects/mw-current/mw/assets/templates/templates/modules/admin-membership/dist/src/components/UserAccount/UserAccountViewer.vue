<script setup lang="ts">
import { computed } from 'vue';

import { userRoles } from 'models/firebase-auth/index.js';
import type { UserAccount } from 'models/membership/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import MemberComponent from 'components/Member/MemberComponent.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { hasRole } = useFirebaseAuth();

const {
  // Auto sort
  freezed,
  m,
} = useViewPage<UserAccount, never>(props.scopeName);

// Computed

const userRolesOptions = computed(() => userRoles.map((value) => ({ label: value, value: value })));
</script>

<template>
  <ExpandableCard
    :avatar-icon="m.photoUrl ? undefined : 'fas fa-user-alt'"
    :avatar-image="m.photoUrl"
    :caption="m.email"
    class="q-mx-auto"
    header-background-color="primary"
    header-dark
    :subtitle="m.uid"
    :title="m.displayName"
  >
    <template #bezel-less-top>
      <q-card-section>
        <MemberComponent :uid="m.uid" />
      </q-card-section>

      <q-separator inset />
    </template>

    <template #body>
      <div class="text-overline text-weight-regular text-uppercase text-muted">Claims</div>

      <q-option-group
        v-model="m.claims"
        :disable="freezed || !hasRole('admin')"
        :options="userRolesOptions"
        type="toggle"
      />
    </template>
  </ExpandableCard>
</template>
