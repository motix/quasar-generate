<script setup lang="ts">
import type { ExpenseActionName } from 'utils/finance/Expense/ExpenseStatus.js';

import { changeGeneralExpenseStatus } from 'services/finance/expenses.js';

import { useExpenseViewPage } from 'composables/finance/expense/useExpenseEditPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import useNotifications from 'composables/useNotifications.js';

import ExpenseViewerNotesAndCollections from 'components/Expense/ExpenseViewerNotesAndCollections.vue';
import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusButton from 'components/shared/document-status/StatusButton.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { notifyErrorDebug, notifySaveDataError } = useNotifications();

const { hasRole } = useFirebaseAuth();

const $p = useExpenseViewPage(props.scopeName);
const {
  // Auto sort
  f,
  freezed,
  m,
} = $p;

// Methods

async function changeStatus(action: ExpenseActionName) {
  $p.freezed.value = true;
  $p.muteRealtimeUpdate.value = true;

  try {
    await changeGeneralExpenseStatus(m.value.id, action);
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
        <StatusBadge v-if="m.isArchived" class="q-mt-md" revert-color :status="m.statusHelper" />
        <StatusButton
          v-else
          class="q-mt-md"
          :freezed="freezed"
          revert-color
          :status="m.statusHelper"
          @change-status="changeStatus($event as ExpenseActionName)"
        />
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
          <div class="col-12">
            <ObjectLink
              color="primary"
              icon="fal fa-building"
              :label="m.supplier.name + (m.supplierExtraInfo ? ` (${m.supplierExtraInfo})` : '')"
              :to="`/suppliers/${m.supplier.code}`"
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
          v-model="m.isCapitalWithdrawal"
          checked-icon="fal fa-check"
          class="col-6"
          color="primary"
          :disable="freezed"
          label="Capital Withdrawal"
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

    <ExpenseViewerNotesAndCollections :scope-name="scopeName" />
  </div>
</template>
