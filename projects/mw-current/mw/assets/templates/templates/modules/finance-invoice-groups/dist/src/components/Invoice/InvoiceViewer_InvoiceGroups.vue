<script setup lang="ts">
import type { InvoiceActionName } from 'utils/finance/Invoice/InvoiceStatus.js';

import { changeGeneralInvoiceStatus } from 'services/finance/invoices.js';

import { useInvoiceViewPage_InvoiceGroups } from 'composables/finance/invoice/useInvoiceEditPage_InvoiceGroups.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import useNotifications from 'composables/useNotifications.js';

import InvoiceViewerNotesAndCollections from 'components/Invoice/InvoiceViewerNotesAndCollections.vue';
import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusButton from 'components/shared/document-status/StatusButton.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { notifyErrorDebug, notifySaveDataError } = useNotifications();

const { hasRole } = useFirebaseAuth();

const $p = useInvoiceViewPage_InvoiceGroups(props.scopeName);
const {
  // Auto sort
  f,
  freezed,
  m,
} = $p;

// Methods

async function changeStatus(action: InvoiceActionName) {
  $p.freezed.value = true;
  $p.muteRealtimeUpdate.value = true;

  try {
    await changeGeneralInvoiceStatus(m.value.id, action);
  } catch (error) {
    console.error(error);
    notifySaveDataError();
    notifyErrorDebug(error);

    $p.muteRealtimeUpdate.value = false;
  }

  $p.freezed.value = false;
}
</script>

<template>
  <div class="q-gutter-y-lg">
    <ExpandableCard
      avatar-icon="fal fa-file-invoice-dollar"
      avatar-top
      body-cell-gutter
      :caption="f.date(m.createDate) || undefined"
      caption-tooltip="Create Date"
      class="q-mx-auto"
      header-background-color="primary"
      header-dark
      side-top
      :subtitle="f.date(m.issueDate) || undefined"
      subtitle-tooltip="Issue Date"
      :title="m.code"
      title-top
    >
      <template #main>
        <q-slide-transition>
          <div v-if="m.group">
            <ObjectLink
              color="white"
              icon-right="fal fa-layer-group"
              :label="m.group.name"
              size="sm"
              :to="`/invoice-groups/${m.group.id}`"
            />
          </div>
        </q-slide-transition>

        <div class="q-mt-md">
          <StatusBadge v-if="m.isArchived" revert-color :status="m.statusHelper" />
          <StatusButton
            v-else
            :freezed="freezed"
            revert-color
            :status="m.statusHelper"
            @change-status="changeStatus($event as InvoiceActionName)"
          />
        </div>
      </template>

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

      <template #bezel-less-top>
        <q-card-section class="q-col-gutter-sm row">
          <div class="col-6">
            <ObjectLink
              color="primary"
              icon="fal fa-user-crown"
              :label="m.customer.name + (m.customerExtraInfo ? ` (${m.customerExtraInfo})` : '')"
              :to="`/customers/${m.customer.code}`"
            />
          </div>

          <div class="col-12">
            {{ m.content }}
          </div>
        </q-card-section>

        <q-separator />
      </template>

      <template #body>
        <q-toggle
          v-model="m.isRequired"
          checked-icon="fal fa-check"
          class="col-6"
          color="primary"
          :disable="freezed"
          label="Required"
          unchecked-icon="clear"
        />

        <div v-if="m.referenceNumber" class="col-6">
          <div
            v-for="(referenceNumber, index) of m.referenceNumber.split(', ')"
            :key="`${index}-${referenceNumber}`"
          >
            <ObjectLink icon="fal fa-hashtag" :label="referenceNumber" :ripple="false" />
          </div>
        </div>

        <div v-else class="flex-break q-pt-none"></div>

        <q-toggle
          v-model="m.isCapitalContribution"
          checked-icon="fal fa-check"
          class="col-6"
          color="primary"
          :disable="freezed"
          label="Capital Contribution"
          unchecked-icon="clear"
        />

        <q-toggle
          v-model="m.isExternal"
          checked-icon="fal fa-check"
          class="col-6"
          color="primary"
          :disable="freezed"
          label="External"
          unchecked-icon="clear"
        />
      </template>
    </ExpandableCard>

    <InvoiceViewerNotesAndCollections :scope-name="scopeName" />
  </div>
</template>
