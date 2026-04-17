<script setup lang="ts">
import { computed, markRaw, watchEffect } from 'vue';

import { object } from 'yup';

import { urlFriendlyNormalizeString } from 'utils/normalization.js';
import { asIsRequired, dateRequired, stringRequired } from 'utils/validation.js';

import type { MemberLite, Todo, TodoVm } from 'models/production/index.js';

import { validateUniqueField } from 'services/firebase-firestore/validation.js';

import useEditorDependencies from 'composables/crud-pages/useEditorDependencies.js';
import useEditPage from 'composables/crud-pages/useEditPage.js';
import useMemberOptions from 'composables/production/shared/useMemberOptions.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import useFormats from 'composables/useFormats.js';

// Private

const validationSchema = markRaw(
  object({
    name: stringRequired('Name').test({
      message: 'Name is already taken',
      test: async (value) =>
        !value ||
        ((await validateUniqueField('production_todos', 'name', value, vm.value.id)) &&
          (await validateUniqueField(
            'production_todos',
            'urlFriendlyName',
            vm.value.urlFriendlyName,
            vm.value.id,
          ))),
    }),
    dueDate: dateRequired('Due Date'),
    owner: asIsRequired<MemberLite>('Owner'),
  }),
);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { hasRole } = useFirebaseAuth();

const f = useFormats();

const $p = useEditPage<Todo, TodoVm>(props.scopeName);
const {
  // Auto sort
  dirty,
  vm,
} = $p;

// Load and release dependencies on onMounted and onUnmounted events
// instead of waiting for switching to editMode
const { editorReady, editorDependenciesStores } = useEditorDependencies(undefined);

const { memberOptions, membersEditorDependenciesStore, filterMemberOptions } = useMemberOptions();

// Computed

const displayDates = computed(
  () =>
    `${f.dateViewModel(vm.value.createDate) as string} - ${
      f.dateViewModel(vm.value.dueDate, '[Due Date]') as string
    }`,
);

// Private Executions

editorDependenciesStores.value = [membersEditorDependenciesStore];

$p.useValidation(validationSchema, 'name', 'dueDate', 'owner');

// Watch

watchEffect(() => {
  vm.value.urlFriendlyName = urlFriendlyNormalizeString(
    vm.value.name.replaceAll('_', '-'), // '_' will be replaced to '.' when retrieving findKey
  ) as string;
});
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-list-check"
    avatar-top
    body-cell-gutter
    :body-loading="!editorReady"
    class="q-mx-auto"
    header-background-color="primary"
    header-dark
    side-top
    :subtitle="displayDates"
    :title="vm.name || '[Name]'"
    :title-end-icon="vm.isPrivate ? 'fas fa-lock' : undefined"
    title-end-icon-color="red-13"
    title-end-icon-superscript
    title-full-width
    title-top
  >
    <template #main>
      <q-toggle
        v-model="vm.isPrivate"
        checked-icon="fal fa-lock"
        class="right-toggle"
        color="white"
        :disable="!$p.isNewPage($p) && !hasRole('manager')"
        icon-color="primary"
        label="Private"
        left-label
        unchecked-icon="fal fa-lock-open"
        @update:model-value="dirty"
      >
      </q-toggle>
    </template>

    <template #side>
      <q-toggle
        v-model="vm.isArchived"
        checked-icon="fal fa-box-taped"
        class="right-toggle"
        color="white"
        :disable="!hasRole('manager')"
        icon-color="primary"
        label="Archived"
        left-label
        unchecked-icon="fal fa-box-open"
        @update:model-value="dirty"
      >
      </q-toggle>
    </template>

    <template #bezel-less-top>
      <q-card-section class="q-col-gutter-sm row">
        <div class="col-6 offset-6 text-right">
          <ObjectLink
            v-if="vm.owner"
            color="primary"
            icon="fal fa-user"
            :label="vm.owner.fullName"
            :to="`/team/member/${vm.owner.id}`"
          />
          <template v-else>[Owner]</template>
        </div>
      </q-card-section>

      <q-separator />
    </template>

    <template #body>
      <QDateInputVal
        v-model="vm.dueDate"
        class="col-6"
        label="Due Date"
        name="dueDate"
        @update:model-value="dirty"
      />

      <QSelectVal
        v-model="vm.owner"
        class="col-6"
        fill-input
        hide-selected
        label="Owner"
        name="owner"
        option-label="fullName"
        option-value="id"
        :options="memberOptions"
        use-input
        @filter="filterMemberOptions"
        @update:model-value="dirty"
      />

      <QInputVal
        v-model="vm.name"
        class="col-12"
        label="Name"
        name="name"
        @update:model-value="dirty"
      />
    </template>
  </ExpandableCard>
</template>
