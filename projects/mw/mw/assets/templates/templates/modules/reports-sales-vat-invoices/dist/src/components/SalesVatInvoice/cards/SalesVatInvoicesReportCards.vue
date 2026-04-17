<script setup lang="ts">
import type { SalesVatInvoicesReport } from 'models/reports/index.js';

import useSalesContractCalculator from 'composables/finance/sales-contract/useSalesContractCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Props

defineProps<{
  reportTitle: string;
  content: SalesVatInvoicesReport;
}>();

// Composables

const { cardWidth, listItemCardWidth, financeUrl } = requiredConfigEntries(
  'cardWidth',
  'listItemCardWidth',
  'financeUrl',
);

const f = useFormats();

const mc = useSalesContractCalculator();
</script>

<template>
  <div>
    <div class="row items-start justify-evenly q-gutter-md">
      <q-card class="bg-accent" dark style="width: 100%" :style="{ maxWidth: cardWidth + 'px' }">
        <q-card-section>
          <div class="text-h6 text-center">
            {{ reportTitle }}
          </div>
        </q-card-section>
      </q-card>

      <div class="flex-break q-mt-none"></div>

      <ExpandableCard
        v-for="(detail, index) in content"
        :key="`${detail.salesContract.code}-${detail.document.code}`"
        body-class="text-caption"
        header-separator
        side-top
        :style="{ maxWidth: listItemCardWidth + 'px' }"
        :subtitle="f.date(detail.document.issueDate) || undefined"
        subtitle-tooltip="Issue Date"
        :title="detail.document.code"
      >
        <template #side>
          <q-item-label caption class="text-overline">
            #{{ index + 1 }}
            <TopTooltip>Number</TopTooltip>
          </q-item-label>

          <q-toggle
            v-model="detail.document.isCancelled"
            checked-icon="fal fa-check"
            class="right-toggle"
            color="primary"
            disable
            unchecked-icon="clear"
          >
            <TopTooltip>Cancelled</TopTooltip>
          </q-toggle>
        </template>

        <template #bezel-less-top>
          <q-card-section class="text-body2" :class="{ 'text-muted': detail.document.isCancelled }">
            {{ detail.document.content }}
          </q-card-section>

          <q-separator />
        </template>

        <template #body>
          <div class="row justify-between">
            <div>Subtotal</div>
            <div :class="{ 'text-muted': detail.document.isCancelled }">
              {{ f.currency(detail.document.subTotal) }}
            </div>
          </div>
          <div v-if="detail.document.vatPercent !== undefined" class="row justify-between">
            <div>
              VAT
              <span :class="{ 'text-muted': detail.document.isCancelled }">
                ({{ f.percent(detail.document.vatPercent) }})
              </span>
            </div>
            <div :class="{ 'text-muted': detail.document.isCancelled }">
              {{ f.currency(mc.vatInvoiceVat(detail.document)) }}
            </div>
          </div>
          <div class="row justify-between">
            <div>
              <strong>Total</strong>
            </div>
            <div :class="{ 'text-muted': detail.document.isCancelled }">
              <strong>{{ f.currency(mc.vatInvoiceTotal(detail.document)) }}</strong>
            </div>
          </div>
        </template>

        <template #bezel-less>
          <q-separator />

          <q-card-section class="q-col-gutter-sm row">
            <div class="col-12">
              <div class="row justify-between no-wrap q-gutter-x-xs">
                <div>
                  <div>
                    <ObjectLink
                      color="primary"
                      :href="`${financeUrl}/sales-contracts/${detail.salesContract.urlFriendlyCode}`"
                      :label="detail.salesContract.code"
                      target="_blank"
                    >
                      <template #icon>
                        <StatusIcon
                          class="q-mr-sm"
                          icon="fal fa-file-signature fa-fw"
                          :status="detail.salesContract.statusHelper"
                        />
                      </template>
                    </ObjectLink>
                  </div>
                  <div>
                    <ObjectLink
                      color="primary"
                      icon="fal fa-user-crown"
                      :label="detail.salesContract.customer.name"
                      size="sm"
                      :to="`/customers/${detail.salesContract.customer.code}`"
                    />
                  </div>
                </div>
                <q-toggle
                  v-model="detail.salesContract.isArchived"
                  checked-icon="fal fa-box-taped"
                  class="right-toggle"
                  color="primary"
                  disable
                  unchecked-icon="fal fa-box-open"
                >
                  <TopTooltip>Archived</TopTooltip>
                </q-toggle>
              </div>
            </div>

            <div class="col-12 text-body2">
              {{ detail.salesContract.content }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-col-gutter-sm row">
            <div v-for="project in detail.salesContract.projects" :key="project.id" class="col-12">
              <div class="row justify-between no-wrap q-gutter-x-xs">
                <ObjectLink
                  color="primary"
                  :label="project.name"
                  :to="`/projects/${project.urlFriendlyName}`"
                  wrap-label
                >
                  <template #icon>
                    <StatusIcon
                      class="q-mr-sm"
                      icon="fal fa-briefcase"
                      :status="project.statusHelper"
                    />
                  </template>
                </ObjectLink>
                <q-toggle
                  v-model="project.isArchived"
                  checked-icon="fal fa-box-taped"
                  class="right-toggle"
                  color="primary"
                  disable
                  unchecked-icon="fal fa-box-open"
                >
                  <TopTooltip>Archived</TopTooltip>
                </q-toggle>
              </div>
            </div>

            <div
              v-for="invoice in detail.salesContract.generalInvoices"
              :key="invoice.id"
              class="col-12"
            >
              <div class="row justify-between no-wrap q-gutter-x-xs">
                <ObjectLink
                  color="primary"
                  :label="invoice.code"
                  :to="`/general-invoices/${invoice.code.replaceAll('.', '_')}`"
                >
                  <template #icon>
                    <StatusIcon
                      class="q-mr-sm"
                      icon="fal fa-file-invoice-dollar"
                      :status="invoice.statusHelper"
                    />
                  </template>
                </ObjectLink>
                <q-toggle
                  v-model="invoice.isArchived"
                  checked-icon="fal fa-box-taped"
                  class="right-toggle"
                  color="primary"
                  disable
                  unchecked-icon="fal fa-box-open"
                >
                  <TopTooltip>Archived</TopTooltip>
                </q-toggle>
              </div>
            </div>
          </q-card-section>

          <template v-if="detail.salesContract.notes !== undefined">
            <q-separator />

            <q-card-section
              class="text-caption text-italic"
              :class="{
                'bg-negative text-white': detail.salesContract.notes?.startsWith('!'),
              }"
              style="border-bottom-left-radius: 4px; border-bottom-right-radius: 4px"
            >
              {{ detail.salesContract.notes }}
            </q-card-section>
          </template>
        </template>
      </ExpandableCard>
    </div>
  </div>
</template>
