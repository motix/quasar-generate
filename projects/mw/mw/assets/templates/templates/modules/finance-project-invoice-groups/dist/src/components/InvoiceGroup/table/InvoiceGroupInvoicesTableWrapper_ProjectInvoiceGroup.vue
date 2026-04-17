<script setup lang="ts">
import useInvoiceGroupInvoicesList_ProjectInvoiceGroup from 'composables/finance/invoice-group/useInvoiceGroupInvoicesList_ProjectInvoiceGroup.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{
  invoiceGroupId: string;
  currentInvoiceCode?: string;
  icon?: string;
  label?: string;
  loadingMessage?: string;
  defaultOpened?: boolean;
}>();

// Composables

const {
  // Auto sort
  buidHasParentInvoiceLink,
  f,
  imc,
  invoiceRecords,
  invoicesReady,
} = useInvoiceGroupInvoicesList_ProjectInvoiceGroup(props);

// Expose

defineExpose({
  invoiceRecords,
});
</script>

<template>
  <FadeTransition>
    <q-item v-if="!invoiceRecords" key="loading" class="q-py-md">
      <FadeTransition>
        <div v-if="!invoicesReady" class="text-center full-width">
          {{ loadingMessage || 'Invoices loading' }}<br />
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </FadeTransition>
    </q-item>

    <q-item v-else-if="invoiceRecords.length === 0" key="empty" class="q-py-md">
      <div class="text-center full-width">There is no invoice in this group.</div>
    </q-item>

    <q-expansion-item
      v-else
      key="ready"
      :default-opened="defaultOpened"
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      :icon="icon || 'fal fa-list-ol'"
      :label="label || 'Invoices'"
      popup
    >
      <q-card>
        <StickyHeaders dense markup-table separated target="#invoicesViewerTable" />

        <q-markup-table id="invoicesViewerTable" bordered dense wrap-cells>
          <thead>
            <tr>
              <th class="q-table--col-auto-width">
                Issue Date<br />
                <span class="text-caption">Create Date</span>
              </th>
              <th class="text-left">Code</th>
              <th class="text-left text-wrap">
                Project / Content<br />
                <span class="text-caption text-italic">Notes</span>
              </th>
              <th class="text-left text-wrap">Reference Number</th>
              <th class="text-wrap">
                Customer<br />
                <span class="text-caption">Extra Info</span>
              </th>
              <th class="q-table--col-auto-width">Status</th>
              <th class="text-right">
                Total<br />
                <span class="text-caption">Balance</span>
              </th>
              <th class="q-table--col-auto-width">Archived</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="{ invoice, parent: project } in invoiceRecords" :key="invoice.id">
              <!-- Issue Date / Create Date -->
              <td class="text-center">
                <div>
                  {{ f.date(invoice.issueDate) }}
                  <TopTooltip>Issue Date</TopTooltip>
                </div>
                <div class="text-caption">
                  {{ f.date(invoice.createDate) }}
                  <TopTooltip>Create Date</TopTooltip>
                </div>
              </td>

              <!-- Code -->
              <td>
                <ObjectLink
                  :color="invoice.code === currentInvoiceCode ? undefined : 'primary'"
                  :label="invoice.code"
                  :ripple="invoice.code !== currentInvoiceCode"
                  :to="
                    invoice.code === currentInvoiceCode
                      ? undefined
                      : project
                        ? buidHasParentInvoiceLink!(invoice, project)
                        : `/general-invoices/${invoice.code.replaceAll('.', '_')}`
                  "
                >
                  <template #icon>
                    <StatusIcon
                      class="q-mr-sm"
                      icon="fal fa-file-invoice-dollar"
                      :status="invoice.statusHelper"
                    />
                  </template>
                </ObjectLink>
              </td>

              <!-- Project / Content / Notes -->
              <td class="text-wrap">
                <div v-if="project">
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
                <div v-else>
                  {{ invoice.content }}
                </div>
                <div
                  v-if="invoice.notes !== undefined"
                  class="text-caption text-italic q-mt-xs"
                  :class="{
                    'bg-negative text-white q-px-sm q-py-xs rounded-borders shadow-2':
                      invoice.notes!.startsWith('!'),
                  }"
                >
                  {{ invoice.notes }}
                </div>
              </td>

              <!-- Reference Number -->
              <td class="text-wrap">
                <template v-if="invoice.referenceNumber">
                  <div
                    v-for="(referenceNumber, index) of invoice.referenceNumber.split(', ')"
                    :key="`${index}-${referenceNumber}`"
                  >
                    <ObjectLink icon="fal fa-hashtag" :label="referenceNumber" :ripple="false" />
                  </div>
                </template>
              </td>

              <!-- Customer / Extra Info -->
              <td class="text-center text-wrap">
                <div>
                  <ObjectLink
                    color="primary"
                    :label="invoice.customer.name"
                    :to="`/customers/${invoice.customer.code}`"
                    wrap-label
                  />
                </div>
                <div v-if="invoice.customerExtraInfo" class="text-caption">
                  {{ invoice.customerExtraInfo }}
                </div>
              </td>

              <!-- Status -->
              <q-td class="text-center">
                <StatusBadge :status="invoice.statusHelper" />
              </q-td>

              <!-- Total / Balance -->
              <td class="text-right">
                <div>
                  {{ f.currency(imc.invoiceTotal(invoice)) }}
                  <TopTooltip>Total</TopTooltip>
                </div>
                <div class="text-caption">
                  {{ f.currency(imc.invoiceBalance(invoice)) }}
                  <TopTooltip>Balance</TopTooltip>
                </div>
              </td>

              <!-- Archived -->
              <td class="text-center">
                <q-toggle
                  v-if="project"
                  v-model="project.isArchived"
                  checked-icon="fal fa-box-taped"
                  color="primary"
                  disable
                  unchecked-icon="fal fa-box-open"
                />
                <q-toggle
                  v-else
                  v-model="invoice.isArchived"
                  checked-icon="fal fa-box-taped"
                  color="primary"
                  disable
                  unchecked-icon="fal fa-box-open"
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-expansion-item>
  </FadeTransition>
</template>
