<script setup lang="ts">
import type { ExpenseActionName } from 'utils/finance/Expense/ExpenseStatus.js';

import { changeProjectExpenseStatus } from 'services/finance/project-expenses.js';

import { useExpenseViewPage_ProjectExpenseGroups } from 'composables/finance/expense/useExpenseEditPage_ProjectExpenseGroups.js';
import useNotifications from 'composables/useNotifications.js';

import ExpenseViewerNotesAndCollections from 'components/Expense/ExpenseViewerNotesAndCollections.vue';
import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusButton from 'components/shared/document-status/StatusButton.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { notifyErrorDebug, notifySaveDataError } = useNotifications();

const $p = useExpenseViewPage_ProjectExpenseGroups(props.scopeName);
const {
  // Auto sort
  f,
  freezed,
  m,
  pm,
} = $p;

// Methods

async function changeStatus(action: ExpenseActionName) {
  $p.freezed.value = true;
  $p.muteRealtimeUpdate.value = true;

  try {
    await changeProjectExpenseStatus($p.pm.value.id, m.value.code, action);
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
      avatar-icon="fal fa-receipt"
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
              :to="`/expense-groups/${m.group.id}`"
            />
          </div>
        </q-slide-transition>

        <div class="q-mt-md">
          <StatusBadge v-if="pm.isArchived" revert-color :status="m.statusHelper" />
          <StatusButton
            v-else
            :freezed="freezed"
            revert-color
            :status="m.statusHelper"
            @change-status="changeStatus($event as ExpenseActionName)"
          />
        </div>
      </template>

      <template #bezel-less-top>
        <q-card-section class="q-col-gutter-sm row">
          <div class="col-6">
            <ObjectLink
              color="primary"
              icon="fal fa-building"
              :label="m.supplier.name + (m.supplierExtraInfo ? ` (${m.supplierExtraInfo})` : '')"
              :to="`/suppliers/${m.supplier.code}`"
            />
          </div>

          <div class="col-12">
            <ObjectLink color="primary" :label="pm.name" :to="`/projects/${pm.urlFriendlyName}`">
              <template #icon>
                <StatusIcon class="q-mr-sm" icon="fal fa-briefcase" :status="pm.statusHelper" />
              </template>
            </ObjectLink>
          </div>

          <div class="col-12">
            {{ m.content }}
          </div>
        </q-card-section>
      </template>
    </ExpandableCard>

    <ExpenseViewerNotesAndCollections :scope-name="scopeName" />
  </div>
</template>
