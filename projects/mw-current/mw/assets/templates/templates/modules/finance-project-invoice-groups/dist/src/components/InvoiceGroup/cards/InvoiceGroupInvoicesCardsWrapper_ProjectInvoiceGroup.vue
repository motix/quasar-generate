<script setup lang="ts">
import { Dark } from 'quasar';

import useInvoiceGroupInvoicesList_ProjectInvoiceGroup from 'composables/finance/invoice-group/useInvoiceGroupInvoicesList_ProjectInvoiceGroup.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Props

const props = defineProps<{
  invoiceGroupId: string;
  currentInvoiceCode?: string;
  label?: string;
  loadingMessage?: string;
}>();

// Composables

const { cardWidth, listItemCardWidth } = requiredConfigEntries('cardWidth', 'listItemCardWidth');

const {
  // Auto sort
  buidHasParentInvoiceLink,
  f,
  imc,
  invoiceRecords,
  invoicesReady,
  onInvoiceClick,
} = useInvoiceGroupInvoicesList_ProjectInvoiceGroup(props);

// Expose

defineExpose({
  invoiceRecords,
});
</script>

<template>
  <FadeTransition>
    <div v-if="!invoiceRecords" key="loading">
      <FadeTransition>
        <div v-if="!invoicesReady" class="text-center">
          {{ loadingMessage || 'Invoices loading' }}<br />
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </FadeTransition>
    </div>

    <div v-else-if="invoiceRecords.length === 0" key="empty" class="text-center">
      There is no invoice in this group.
    </div>

    <div v-else key="ready" class="q-gutter-y-md">
      <q-card
        class="q-mx-auto bg-accent"
        :class="Dark.isActive ? undefined : 'shadow-2'"
        dark
        style="width: 100%"
        :style="{ maxWidth: cardWidth + 'px' }"
      >
        <q-card-section>
          <div class="text-h6 text-center">{{ label || 'Invoices' }}</div>
        </q-card-section>
      </q-card>

      <!-- Bottom padding to be consistent with editor -->
      <div class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs">
        <ExpandableCard
          v-for="{ invoice, parent: project } in invoiceRecords"
          :key="invoice.id"
          body-class="q-col-gutter-sm row"
          :caption="f.date(invoice.createDate) || undefined"
          caption-tooltip="Create Date"
          :clickable="invoice.code !== currentInvoiceCode"
          :external-link-url="
            project
              ? buidHasParentInvoiceLink!(invoice, project)
              : `/general-invoices/${invoice.code.replaceAll('.', '_')}`
          "
          header-separator
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="f.date(invoice.issueDate) || undefined"
          subtitle-tooltip="Issue Date"
          :title="invoice.code"
          @click="
            invoice.code === currentInvoiceCode ? undefined : onInvoiceClick(invoice, project)
          "
        >
          <template #main>
            <StatusBadge class="q-mt-sm" :status="invoice.statusHelper" />
          </template>

          <template #side>
            <q-toggle
              v-if="project"
              v-model="project.isArchived"
              checked-icon="fal fa-box-taped"
              class="right-toggle"
              color="primary"
              disable
              unchecked-icon="fal fa-box-open"
            >
              <TopTooltip>Archived</TopTooltip>
            </q-toggle>
            <q-toggle
              v-else
              v-model="invoice.isArchived"
              checked-icon="fal fa-box-taped"
              class="right-toggle"
              color="primary"
              disable
              unchecked-icon="fal fa-box-open"
            >
              <TopTooltip>Archived</TopTooltip>
            </q-toggle>

            <q-item-label caption>
              {{ f.currency(imc.invoiceTotal(invoice)) }}
              <TopTooltip>Total</TopTooltip>
            </q-item-label>
            <q-item-label caption>
              <span class="text-muted">
                {{ f.currency(imc.invoiceBalance(invoice)) }}
              </span>
              <TopTooltip>Balance</TopTooltip>
            </q-item-label>
          </template>

          <template #body>
            <div class="col-6">
              <ObjectLink
                color="primary"
                icon="fal fa-user-crown"
                :label="
                  invoice.customer.name +
                  (invoice.customerExtraInfo ? ` (${invoice.customerExtraInfo})` : '')
                "
                :to="`/customers/${invoice.customer.code}`"
              />
            </div>

            <div v-if="project" class="col-12">
              <ObjectLink
                color="primary"
                :label="project.name"
                :to="`/projects/${project.urlFriendlyName}`"
              >
                <template #icon>
                  <StatusIcon
                    class="q-mr-sm"
                    icon="fal fa-briefcase"
                    :status="project.statusHelper"
                  />
                </template>
              </ObjectLink>
            </div>
            <div v-else class="col-12 text-body2">
              {{ invoice.content }}
            </div>

            <div v-if="invoice.referenceNumber" class="col-6">
              <div
                v-for="(referenceNumber, index) of invoice.referenceNumber!.split(', ')"
                :key="`${index}-${referenceNumber}`"
              >
                <ObjectLink icon="fal fa-hashtag" :label="referenceNumber" :ripple="false" />
              </div>
            </div>
          </template>

          <template v-if="invoice.notes !== undefined" #bezel-less>
            <q-separator />

            <q-card-section
              class="text-caption text-italic"
              :class="{
                'bg-negative text-white': invoice.notes?.startsWith('!'),
              }"
              style="border-bottom-left-radius: 4px; border-bottom-right-radius: 4px"
            >
              {{ invoice.notes }}
            </q-card-section>
          </template>
        </ExpandableCard>
      </div>
    </div>
  </FadeTransition>
</template>
