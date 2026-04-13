<script setup lang="ts">
import type { PayrollActionName } from 'utils/hr/payroll/PayrollStatus.js';

import type { Payroll, PayrollVm } from 'models/hr/index.js';

import { changePayrollStatus } from 'services/hr/payrolls.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useNotifications from 'composables/useNotifications.js';

import StatusButton from 'components/shared/document-status/StatusButton.vue';

import PayrollDetailsViewerCards from './cards/PayrollDetailsViewerCards.vue';
import PayrollDetailsViewerTable from './table/PayrollDetailsViewerTable.vue';

// Props

const props = defineProps<{
  scopeName: string;
  hideExtraInfo: boolean;
}>();

// Composables

const f = useFormats();

const { notifyErrorDebug, notifySaveDataError } = useNotifications();

const { isTableView, isCardsView } = useMultiViews();

const $p = useViewPage<Payroll, PayrollVm>(props.scopeName);
const {
  // Auto sort
  freezed,
  m,
} = $p;

// Methods

async function changeStatus(action: PayrollActionName) {
  $p.freezed.value = true;
  $p.muteRealtimeUpdate.value = true;

  try {
    await changePayrollStatus($p.m.value.id, action);
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
      avatar-icon="fal fa-money-bill"
      avatar-top
      class="q-mx-auto"
      header-background-color="primary"
      header-dark
      side-top
      :title="m.code"
      title-no-wrap
      title-top
    >
      <template #main>
        <StatusButton
          class="q-mt-sm"
          :freezed="freezed"
          revert-color
          :status="m.statusHelper"
          @change-status="changeStatus($event as PayrollActionName)"
        />
      </template>

      <template #side>
        <q-item-label caption>{{ f.yearMonth(m.year, m.month) }}</q-item-label>
        <q-item-label caption>
          {{ `${m.workingDays} working day${m.workingDays > 1 ? 's' : ''}` }}
        </q-item-label>
        <q-item-label caption>
          {{ f.percent(m.socialInsurancePercent, 1) }} social insurance
        </q-item-label>
        <q-item-label caption>{{ f.percent(m.unionDuesPercent, 1) }} union dues</q-item-label>
      </template>
    </ExpandableCard>

    <FadeTransition>
      <div v-if="m.details.length === 0" key="empty" class="text-center">
        The is no detail in this payroll.
      </div>

      <PayrollDetailsViewerTable v-else-if="isTableView" key="tableView" :scope-name="scopeName" />

      <PayrollDetailsViewerCards
        v-else-if="isCardsView"
        key="cardsView"
        :hide-extra-info="hideExtraInfo"
        :scope-name="scopeName"
      />
    </FadeTransition>
  </div>
</template>
