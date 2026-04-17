<script setup lang="ts">
import { computed } from 'vue';

import type { Project, ProjectVm } from 'models/production/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import useFormats from 'composables/useFormats.js';

// Props

const props = withDefaults(
  defineProps<{
    scopeName: string;
    readonly?: boolean;
  }>(),
  {
    readonly: false,
  },
);

// Composables

const { financeUrl } = requiredConfigEntries('financeUrl');

const { hasRole } = useFirebaseAuth();

const f = useFormats();

const {
  // Auto sort
  freezed,
  m,
} = useViewPage<Project, ProjectVm>(props.scopeName);

// Computed

const displayDates = computed(
  () => `${f.date(m.value.startDate) as string} - ${f.date(m.value.finishDate) as string}`,
);
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-briefcase"
    avatar-top
    class="q-mx-auto"
    external-link-tooltip="Finance project"
    :external-link-url="
      hasRole('finance') ? `${financeUrl}/projects/${m.urlFriendlyName}` : undefined
    "
    header-background-color="primary"
    header-dark
    side-top
    :subtitle="displayDates"
    :title="m.name"
    :title-end-icon="m.isPrivate ? 'fas fa-lock' : undefined"
    title-end-icon-color="red-13"
    title-end-icon-superscript
    title-full-width
    title-top
  >
    <template #side>
      <q-toggle
        v-model="m.isArchived"
        checked-icon="fal fa-box-taped"
        class="right-toggle"
        color="white"
        :disable="readonly || freezed || !hasRole('manager')"
        icon-color="primary"
        label="Archived"
        left-label
        unchecked-icon="fal fa-box-open"
      >
      </q-toggle>
    </template>

    <template #bezel-less>
      <q-card-section class="q-col-gutter-sm row">
        <div class="col-6">
          <ObjectLink
            :color="hasRole('project-leader') ? 'primary' : undefined"
            icon="fal fa-user-crown"
            :label="m.customer.name"
            :ripple="hasRole('project-leader')"
            :to="hasRole('project-leader') ? `/customers/${m.customer.code}` : undefined"
          />
        </div>

        <div class="col-6 text-right">
          <ObjectLink
            color="primary"
            icon="fal fa-user"
            :label="m.owner.fullName"
            :to="`/team/member/${m.owner.id}`"
          />
        </div>

        <div class="col-12 text-caption">
          {{ m.customerContact }}
        </div>

        <div v-if="!!m.description" class="col-12">
          {{ m.description }}
        </div>
      </q-card-section>
    </template>
  </ExpandableCard>
</template>
