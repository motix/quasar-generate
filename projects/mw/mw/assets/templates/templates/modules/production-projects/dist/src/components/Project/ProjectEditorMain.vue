<script setup lang="ts">
import { computed, markRaw, watchEffect } from 'vue';

import { object } from 'yup';

import { urlFriendlyNormalizeString } from 'utils/normalization.js';
import { asIsRequired, dateRequired, stringRequired } from 'utils/validation.js';

import type { CustomerLite, MemberLite } from 'models/production/index.js';

import { validateUniqueField } from 'services/firebase-firestore/validation.js';

import useProjectEditPage from 'composables/production/project/useProjectEditPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

// Private

const validationSchema = markRaw(
  object({
    name: stringRequired('Name').test({
      message: 'Name is already taken',
      test: async (value) =>
        !value ||
        ((await validateUniqueField('production_projects', 'name', value, vm.value.id)) &&
          (await validateUniqueField(
            'production_projects',
            'urlFriendlyName',
            vm.value.urlFriendlyName,
            vm.value.id,
          ))),
    }),
    customerContact: stringRequired('Customer Contact'),
    startDate: dateRequired('Start Date'),
    finishDate: dateRequired('Finish Date'),
    owner: asIsRequired<MemberLite>('Owner'),
    customer: asIsRequired<CustomerLite>('Customer'),
  }),
);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { hasRole } = useFirebaseAuth();

const $p = useProjectEditPage(props.scopeName);
const {
  // Auto sort
  customerOptions,
  dirty,
  editorReady,
  f,
  filterCustomerOptions,
  filterMemberOptions,
  memberOptions,
  vm,
} = $p;

// Computed

const displayDates = computed(
  () =>
    `${f.dateViewModel(vm.value.startDate, '[Start Date]') as string} - ${
      f.dateViewModel(vm.value.finishDate, '[Finish Date]') as string
    }`,
);

// Private Executions

const { validate } = $p.useValidationForm(
  validationSchema,
  vm.value,
  'name',
  'customerContact',
  'startDate',
  'finishDate',
  'owner',
  'customer',
);

// Watch

watchEffect(() => {
  vm.value.urlFriendlyName = urlFriendlyNormalizeString(
    vm.value.name.replaceAll('_', '-'), // '_' will be replaced to '.' when retrieving findKey
  ) as string;
});

// Expose

defineExpose({
  validate: async () => (await validate()).valid,
});
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-briefcase"
    avatar-top
    body-cell-gutter
    :body-loading="!editorReady"
    class="q-mx-auto"
    :expandable="!$p.isNewPage($p)"
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
        <div class="col-6">
          <ObjectLink
            v-if="vm.customer"
            :color="hasRole('project-leader') ? 'primary' : undefined"
            icon="fal fa-user-crown"
            :label="vm.customer.name"
            :ripple="hasRole('project-leader')"
            :to="hasRole('project-leader') ? `/customers/${vm.customer.code}` : undefined"
          />
          <template v-else>[Customer]</template>
        </div>

        <div class="col-6 text-right">
          <ObjectLink
            v-if="vm.owner"
            color="primary"
            icon="fal fa-user"
            :label="vm.owner.fullName"
            :to="`/team/member/${vm.owner.id}`"
          />
          <template v-else>[Owner]</template>
        </div>

        <div class="col-12 text-caption">
          {{ vm.customerContact || '[Customer Contact]' }}
        </div>

        <div v-if="!!vm.description" class="col-12">
          {{ vm.description }}
        </div>
      </q-card-section>

      <q-separator />
    </template>

    <template #body>
      <QDateInputVal
        v-model="vm.startDate"
        class="col-6"
        label="Start Date"
        name="startDate"
        @update:model-value="dirty"
      />

      <QDateInputVal
        v-model="vm.finishDate"
        class="col-6"
        label="Finish Date"
        name="finishDate"
        @update:model-value="dirty"
      />

      <QSelectVal
        v-model="vm.customer"
        class="col-6"
        fill-input
        hide-selected
        label="Customer"
        name="customer"
        option-label="name"
        option-value="id"
        :options="customerOptions"
        use-input
        @filter="filterCustomerOptions"
        @update:model-value="dirty"
      />

      <QInputVal
        v-model="vm.customerContact"
        class="col-6"
        label="Customer Contact"
        name="customerContact"
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

      <q-input
        v-model="vm.description"
        class="col-12"
        clearable
        hint="(optional)"
        label="Description"
        @update:model-value="dirty"
      />
    </template>
  </ExpandableCard>
</template>
