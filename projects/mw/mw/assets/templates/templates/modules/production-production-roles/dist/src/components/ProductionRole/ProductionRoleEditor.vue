<script setup lang="ts">
import { markRaw } from 'vue';

import { object } from 'yup';

import { integerRequired, stringRequired } from 'utils/validation.js';

import type { ProductionRole, ProductionRoleVm } from 'models/production/index.js';

import { validateUniqueField } from 'services/firebase-firestore/validation.js';

import useEditPage from 'composables/crud-pages/useEditPage.js';

// Private

const validationSchema = markRaw(
  object({
    name: stringRequired('Name').test({
      message: 'Name is already taken',
      test: async (value) =>
        !value ||
        (await validateUniqueField('production_productionRoles', 'name', value, vm.value.id)),
    }),
    position: integerRequired('Position').min(1),
  }),
);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useEditPage<ProductionRole, ProductionRoleVm>(props.scopeName);
const {
  // Auto sort
  dirty,
  vm,
} = $p;

// Private Executions

$p.useValidation(validationSchema, 'name', 'position');
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-diagram-subtask"
    body-row-gutter
    :caption="vm.position || vm.position === 0 ? '#' + vm.position : '#[Position]'"
    class="q-mx-auto"
    header-background-color="primary"
    header-dark
    :title="vm.name || '[Name]'"
  >
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
    </template>

    <template #body>
      <QInputVal v-model="vm.name" label="Name" name="name" @update:model-value="dirty" />

      <QInputVal
        v-model.number="vm.position"
        label="Position"
        name="position"
        @update:model-value="dirty"
      />
    </template>
  </ExpandableCard>
</template>
