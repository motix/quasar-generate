<script setup lang="ts">
import type { TransactionActionName } from 'utils/finance/Transaction/TransactionStatus.js';

import { changeGeneralInvoiceTransactionStatus } from 'services/finance/invoices.js';

import { useTransactionViewPage_Invoices } from 'composables/finance/transaction/useTransactionEditPage_Invoices.js';
import useNotifications from 'composables/useNotifications.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusButton from 'components/shared/document-status/StatusButton.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import TransactionViewerNotesDetails from 'components/Transaction/TransactionViewerNotesDetails.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { notifyErrorDebug, notifySaveDataError } = useNotifications();

const $p = useTransactionViewPage_Invoices<true>(props.scopeName);
const {
  // Auto sort
  f,
  freezed,
  m,
  mc,
  pm,
} = $p;

// Methods

async function changeStatus(action: TransactionActionName) {
  $p.freezed.value = true;
  $p.muteRealtimeUpdate.value = true;

  try {
    await changeGeneralInvoiceTransactionStatus($p.pm.value.id, $p.m.value.code, action);
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
      avatar-icon="fal fa-exchange"
      avatar-top
      body-class="q-col-gutter-sm row"
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
        <StatusBadge v-if="pm.isArchived" class="q-mt-md" revert-color :status="m.statusHelper" />
        <StatusButton
          v-else
          class="q-mt-md"
          :freezed="freezed"
          revert-color
          :status="m.statusHelper"
          @change-status="changeStatus($event as TransactionActionName)"
        />
      </template>

      <template #side>
        <q-item-label>
          {{ m.type }}
          <TopTooltip>Type</TopTooltip>
        </q-item-label>
      </template>

      <template #body>
        <div class="col-12 row justify-between">
          <div>
            <ObjectLink
              v-if="mc.transactionHasCustomer(m)"
              color="primary"
              icon="fal fa-user-crown"
              :label="pm.customer.name"
              :to="`/customers/${pm.customer.code}`"
            />
            <ObjectLink
              v-if="
                mc.transactionHasSourceAccount(m) &&
                !mc.transactionNegative(m) &&
                !!m.sourceFinanceAccount
              "
              color="primary"
              icon="fal fa-piggy-bank"
              :label="m.sourceFinanceAccount.name"
              :to="`/finance-accounts/${m.sourceFinanceAccount.id}`"
            />
            <ObjectLink
              v-if="
                mc.transactionHasDestinationAccount(m) &&
                mc.transactionNegative(m) &&
                !!m.destinationFinanceAccount
              "
              color="primary"
              icon="fal fa-piggy-bank"
              :label="m.destinationFinanceAccount.name"
              :to="`/finance-accounts/${m.destinationFinanceAccount.id}`"
            />
          </div>

          <div>
            <q-icon v-if="!mc.transactionNegative(m)" name="fal fa-arrow-right-long" />
            <q-icon v-else name="fal fa-arrow-left-long" />
          </div>

          <div>
            <ObjectLink
              v-if="
                mc.transactionHasSourceAccount(m) &&
                mc.transactionNegative(m) &&
                !!m.sourceFinanceAccount
              "
              color="primary"
              icon="fal fa-piggy-bank"
              :label="m.sourceFinanceAccount.name"
              :to="`/finance-accounts/${m.sourceFinanceAccount.id}`"
            />
            <ObjectLink
              v-if="
                mc.transactionHasDestinationAccount(m) &&
                !mc.transactionNegative(m) &&
                !!m.destinationFinanceAccount
              "
              color="primary"
              icon="fal fa-piggy-bank"
              :label="m.destinationFinanceAccount.name"
              :to="`/finance-accounts/${m.destinationFinanceAccount.id}`"
            />
          </div>
        </div>

        <div class="col-6">
          <ObjectLink
            color="primary"
            :label="pm.code"
            :to="`/general-invoices/${pm.code.replaceAll('.', '_')}`"
          >
            <template #icon>
              <StatusIcon
                class="q-mr-sm"
                icon="fal fa-file-invoice-dollar"
                :status="pm.statusHelper"
              />
            </template>
          </ObjectLink>
        </div>

        <div class="col-12">
          {{ m.content }}
        </div>
      </template>
    </ExpandableCard>

    <TransactionViewerNotesDetails :scope-name="scopeName" />
  </div>
</template>
