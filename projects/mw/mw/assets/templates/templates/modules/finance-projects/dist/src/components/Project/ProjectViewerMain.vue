<script setup lang="ts">
import useProjectViewPage from 'composables/finance/project/useProjectViewPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

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

const { productionUrl } = requiredConfigEntries('productionUrl');

const { hasRole } = useFirebaseAuth();

const {
  // Auto sort
  f,
  freezed,
  m,
} = useProjectViewPage(props.scopeName);
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-briefcase"
    avatar-top
    body-cell-gutter
    class="q-mx-auto"
    external-link-tooltip="Production project"
    :external-link-url="`${productionUrl}/projects/${m.urlFriendlyName}`"
    header-background-color="primary"
    header-dark
    side-top
    :subtitle="f.date(m.finishDate) || undefined"
    subtitle-tooltip="Finish Date"
    :title="m.name"
    title-full-width
    title-top
  >
    <template #main>
      <StatusBadge class="q-mt-md" revert-color :status="m.statusHelper" />
    </template>

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
      />
    </template>

    <template #bezel-less-top>
      <q-card-section class="q-col-gutter-sm row">
        <div class="col-6">
          <ObjectLink
            color="primary"
            icon="fal fa-user-crown"
            :label="m.customer.name"
            :to="`/customers/${m.customer.code}`"
          />
        </div>

        <div class="col-6 text-right">
          <ObjectLink icon="fal fa-user" :label="m.owner" :ripple="false" />
        </div>

        <div class="col-12 text-caption">{{ m.customerContact }}</div>
      </q-card-section>

      <q-separator />
    </template>

    <template #body>
      <q-toggle
        v-model="m.isInvoiceRequired"
        checked-icon="fal fa-file-invoice-dollar"
        class="col-6"
        color="primary"
        :disable="readonly || freezed"
        label="Invoice Required"
        unchecked-icon="clear"
      />
    </template>
  </ExpandableCard>
</template>
