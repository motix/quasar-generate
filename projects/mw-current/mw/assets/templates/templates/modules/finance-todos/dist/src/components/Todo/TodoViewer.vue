<script setup lang="ts">
import { computed } from 'vue';

import type { Todo, TodoVm } from 'models/finance/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import useFormats from 'composables/useFormats.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { hasRole } = useFirebaseAuth();

const f = useFormats();

const {
  // Auto sort
  freezed,
  m,
} = useViewPage<Todo, TodoVm>(props.scopeName);

// Computed

const displayDates = computed(
  () => `${f.date(m.value.createDate) as string} - ${f.date(m.value.dueDate) as string}`,
);
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-list-check"
    avatar-top
    class="q-mx-auto"
    expandable
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
        :disable="freezed || !hasRole('manager')"
        icon-color="primary"
        label="Archived"
        left-label
        unchecked-icon="fal fa-box-open"
      >
      </q-toggle>
    </template>

    <template #bezel-less>
      <q-card-section class="q-col-gutter-sm row">
        <div class="col-6 offset-6 text-right">
          <ObjectLink
            color="primary"
            icon="fal fa-user"
            :label="m.owner.fullName"
            :to="`/team/member/${m.owner.id}`"
          />
        </div>
      </q-card-section>
    </template>
  </ExpandableCard>
</template>
