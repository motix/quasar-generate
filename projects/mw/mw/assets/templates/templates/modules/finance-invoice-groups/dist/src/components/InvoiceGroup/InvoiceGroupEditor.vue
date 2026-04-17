<script setup lang="ts">
import { markRaw } from 'vue';

import { object } from 'yup';

import { stringRequired } from 'utils/validation.js';

import type { InvoiceGroup, InvoiceGroupVm } from 'models/finance/index.js';

import { validateUniqueField } from 'services/firebase-firestore/validation.js';

import useEditPage from 'composables/crud-pages/useEditPage.js';

// Private

const validationSchema = markRaw(
  object({
    name: stringRequired('Name').test({
      message: 'Name is already taken',
      test: async (value) =>
        !value || (await validateUniqueField('finance_invoiceGroups', 'name', value, vm.value.id)),
    }),
  }),
);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useEditPage<InvoiceGroup, InvoiceGroupVm>(props.scopeName);
const {
  // Auto sort
  dirty,
  vm,
} = $p;

// Private Executions

$p.useValidation(validationSchema, 'name');
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-layer-group"
    body-row-gutter
    :caption="vm.description || undefined"
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

      <q-input
        v-model="vm.description"
        clearable
        hint="(optional)"
        label="Description"
        @update:model-value="dirty"
      />
    </template>
  </ExpandableCard>
</template>
