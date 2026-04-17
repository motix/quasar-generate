<script setup lang="ts">
// sort-imports-ignore

import { computed, watch } from 'vue';

import type { QuotationActionName } from 'utils/finance/Quotation/QuotationStatus.js';

import { changeQuotationStatus } from 'services/finance/quotations.js';

import useQuotationViewPage from 'composables/finance/quotation/useQuotationViewPage.js';
import useMultiViews from 'composables/useMultiViews.js';
import useNotifications from 'composables/useNotifications.js';

import QuotationDetailsViewerCards from 'components/Quotation/cards/QuotationDetailsViewerCards.vue';
import QuotationDetailsViewerTable from 'components/Quotation/table/QuotationDetailsViewerTable.vue';
import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusButton from 'components/shared/document-status/StatusButton.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// <% if (config.hasModule('finance-project-invoices')) { %>•+ finance-project-invoices
import QuotationInvoiceLink from 'components/Quotation/QuotationInvoiceLink.vue';
// •- /finance-project-invoices<% } else { %>•! finance-project-invoices absent<% } %>

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { notifyErrorDebug, notifySaveDataError } = useNotifications();

const { isTableView, isCardsView } = useMultiViews();

const $p = useQuotationViewPage(props.scopeName);
const {
  // Auto sort
  f,
  freezed,
  m,
  pm,
} = $p;

// Methods

async function changeStatus(action: QuotationActionName) {
  $p.freezed.value = true;
  $p.muteRealtimeUpdate.value = true;

  try {
    if (action === 'approveAndConfirm') {
      await changeQuotationStatus(pm.value.id, m.value.code, 'approve');
      $p.muteRealtimeUpdate.value = true;
      await changeQuotationStatus(pm.value.id, m.value.code, 'confirm');
    } else {
      await changeQuotationStatus(pm.value.id, m.value.code, action);
    }
  } catch (error) {
    console.error(error);
    notifySaveDataError();
    notifyErrorDebug(error);

    $p.muteRealtimeUpdate.value = false;
  }

  $p.freezed.value = false;
}

// Watch

// When switching between quotations, the new model is set before component is unmounted.
// In such case, do not fire viewer watch.
let initialModel = m.value;
$p.watchViewer(
  computed(() =>
    $p.model.value?.code === initialModel.code ? $p.model.value.isRevised : initialModel.isRevised,
  ),
);
// Anytime the model is saved, new model of the same item will be assigned.
// Update it for latest data.
watch($p.model, (value) => {
  if (value?.code === initialModel.code && value !== initialModel) {
    initialModel = value;
  }
});
</script>

<template>
  <div class="q-gutter-y-lg">
    <ExpandableCard
      avatar-icon="fal fa-file-invoice"
      avatar-top
      body-cell-gutter
      :caption="f.date(m.createDate) || undefined"
      caption-tooltip="Create Date"
      class="q-mx-auto"
      header-background-color="primary"
      header-dark
      :subtitle="f.date(pm.finishDate) || undefined"
      subtitle-tooltip="Project Finish Date"
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
          @change-status="changeStatus($event as QuotationActionName)"
        />
      </template>

      <template #bezel-less-top>
        <q-card-section class="q-col-gutter-sm row">
          <div class="col-6">
            <ObjectLink
              color="primary"
              icon="fal fa-user-crown"
              :label="pm.customer.name"
              :to="`/customers/${pm.customer.code}`"
            />
          </div>

          <!-- <% if (config.hasModule('finance-project-invoices')) { %>•+ finance-project-invoices -->
          <QuotationInvoiceLink :scope-name="scopeName" />
          <!-- •- /finance-project-invoices<% } else { %>•! finance-project-invoices absent<% } %> -->

          <div class="col-12">
            <ObjectLink color="primary" :label="pm.name" :to="`/projects/${pm.urlFriendlyName}`">
              <template #icon>
                <StatusIcon class="q-mr-sm" icon="fal fa-briefcase" :status="pm.statusHelper" />
              </template>
            </ObjectLink>
          </div>
        </q-card-section>

        <q-separator />
      </template>

      <template #body>
        <q-toggle
          v-model="m.isRevised"
          checked-icon="fal fa-check-double"
          class="col-6"
          color="primary"
          :disable="freezed"
          label="Revised"
          unchecked-icon="clear"
        />
      </template>
    </ExpandableCard>

    <FadeTransition>
      <QuotationDetailsViewerTable v-if="isTableView" key="tableView" :scope-name="scopeName" />

      <QuotationDetailsViewerCards
        v-else-if="isCardsView"
        key="cardsView"
        :scope-name="scopeName"
      />
    </FadeTransition>
  </div>
</template>
