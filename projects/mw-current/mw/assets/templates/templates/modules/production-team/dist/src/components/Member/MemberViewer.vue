<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { where } from 'firebase/firestore';

import type { Member, ProductionRoleLite } from 'models/production/index.js';

import { useProductionRoleLitesStore } from 'stores/production/ProductionRoleLites.js';
import { productionRolesStoreDefaultSort } from 'stores/production/ProductionRoles.js';

import useEditorDependencies from 'composables/crud-pages/useEditorDependencies.js';
import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

// Private

const inactiveProductionRole = ref<ProductionRoleLite | null>(null);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const productionRoleStore = useProductionRoleLitesStore();

const { hasRole } = useFirebaseAuth();

const {
  // Auto sort
  freezed,
  m,
} = useViewPage<Member, never>(props.scopeName);

const { editorReady: viewerReady, editorDependenciesStores } = useEditorDependencies(undefined);

// Computed

const productionRoleOptions = computed(() => [
  { label: 'None', value: undefined },
  ...(inactiveProductionRole.value
    ? [
        {
          color: 'muted',
          disable: true,
          label: inactiveProductionRole.value.name,
          value: inactiveProductionRole.value,
        },
      ]
    : []),
  ...productionRoleStore.docs.map((value) => ({ label: value.name, value })),
]);

const defaultProductionRole = computed({
  get: () =>
    productionRoleStore.docs.find((value) => value.id === m.value.defaultProductionRole?.id) ||
    m.value.defaultProductionRole,
  set: (value) => {
    if (value) {
      m.value.defaultProductionRole = value;
    }
  },
});

// Private Executions

editorDependenciesStores.value = [
  {
    store: productionRoleStore,
    payload: {
      queryConstraints: [where('isActive', '==', true), ...productionRolesStoreDefaultSort],
    },
  },
];

// Watch

watch(viewerReady, (value) => {
  if (value && m.value.defaultProductionRole) {
    const productionRole = productionRoleStore.docs.find(
      (value) => value.id === m.value.defaultProductionRole?.id,
    );

    if (productionRole) {
      m.value.defaultProductionRole = productionRole;
    } else {
      m.value.defaultProductionRole.name += ' (inactive)';
      inactiveProductionRole.value = m.value.defaultProductionRole;
    }
  }
});
</script>

<template>
  <ExpandableCard
    :avatar-icon="m.photoUrl ? undefined : 'fas fa-user-alt'"
    :avatar-image="m.photoUrl || undefined"
    :body-loading="!viewerReady"
    :caption="m.defaultProductionRole?.name"
    class="q-mx-auto"
    header-background-color="primary"
    header-dark
    :title="m.fullName"
  >
    <template #side>
      <q-toggle
        v-model="m.isActive"
        checked-icon="fal fa-power-off"
        class="right-toggle"
        color="white"
        disable
        icon-color="primary"
        label="Active"
        left-label
        unchecked-icon="clear"
      />
    </template>

    <template #body>
      <div class="text-overline text-weight-regular text-uppercase text-muted">
        Default Production Role
      </div>

      <q-option-group
        v-model="defaultProductionRole"
        :disable="freezed || !hasRole('project-leader')"
        :options="productionRoleOptions"
      />
    </template>
  </ExpandableCard>
</template>
