<script setup lang="ts">
import {
  isGeneralInvoiceReportDetail,
  isProjectInvoiceReportDetail,
} from 'utils/reports/invoices.js';

import type { InvoicesReport, InvoicesReportDetail } from 'models/reports/index.js';

import useInvoicesReportSummary from 'composables/reports/invoice/useInvoicesReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Props

const props = defineProps<{
  reportTitle: string;
  content: InvoicesReport;
  showProjectInvoices: boolean;
  showGeneralInvoices: boolean;
  selectedFinanceAccounts: { [index: string]: boolean };
  selectedInvoiceGroups: { [index: string]: boolean };
}>();

// Composables

const { cardWidth, listItemCardWidth, financeUrl } = requiredConfigEntries(
  'cardWidth',
  'listItemCardWidth',
  'financeUrl',
);

const f = useFormats();

const { totalInvoice, totalReceipt, totalBalance, totalReceiptByFinanceAccount } =
  useInvoicesReportSummary(props.content.details, props.content.financeAccounts);

// Methods

function invoiceLink(detail: InvoicesReportDetail) {
  return `${financeUrl}/${
    detail.project ? `project-invoices/${detail.project.urlFriendlyName}` : 'general-invoices'
  }/${detail.invoice.code.replaceAll('.', '_')}`;
}
</script>

<template>
  <div>
    <div class="row items-start justify-evenly q-gutter-md">
      <q-card class="bg-accent" dark style="width: 100%" :style="{ maxWidth: cardWidth + 'px' }">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-center">
            {{ reportTitle }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row justify-between">
            <div>Total Invoice</div>
            <div class="text-warning">
              {{ f.currency(totalInvoice) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total Receipt</div>
            <div class="text-warning">
              {{ f.currency(totalReceipt, true) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total Balance</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(totalBalance) }}
              </strong>
            </div>
          </div>
        </q-card-section>

        <template v-if="content.financeAccounts.length > 0">
          <q-separator dark inset />

          <q-card-section>
            <q-slide-transition>
              <div
                v-if="!content.financeAccounts.some((value) => selectedFinanceAccounts[value.id])"
              >
                No finance account selected.
              </div>
            </q-slide-transition>

            <q-slide-transition
              v-for="financeAccount in content.financeAccounts"
              :key="financeAccount.id"
            >
              <div v-if="selectedFinanceAccounts[financeAccount.id]" class="row justify-between">
                <div>{{ financeAccount.name }}</div>
                <div class="text-warning">
                  {{ f.currency(totalReceiptByFinanceAccount[financeAccount.id]) }}
                </div>
              </div>
            </q-slide-transition>
          </q-card-section>
        </template>
      </q-card>

      <div class="flex-break q-mt-none"></div>

      <template v-for="(detail, index) in content.details" :key="detail.invoice.id">
        <ExpandableCard
          v-show="
            ((showProjectInvoices && isProjectInvoiceReportDetail(detail)) ||
              (showGeneralInvoices && isGeneralInvoiceReportDetail(detail))) &&
            (detail.invoice.group
              ? selectedInvoiceGroups[detail.invoice.group.id]
              : selectedInvoiceGroups[''])
          "
          :external-link-url="invoiceLink(detail)"
          header-separator
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="f.date(detail.invoice.issueDate) || undefined"
          subtitle-tooltip="Issue Date"
          :title="detail.invoice.code"
          title-full-width
        >
          <template #main>
            <div>
              <ObjectLink
                v-if="detail.invoice.group"
                :href="`${financeUrl}/invoice-groups/${detail.invoice.group.id}`"
                icon-right="fal fa-layer-group"
                :label="detail.invoice.group.name"
                size="sm"
                target="_blank"
              />
            </div>

            <div class="q-mt-md">
              <StatusBadge :status="detail.invoice.statusHelper" />
            </div>
          </template>

          <template #side>
            <q-item-label caption class="text-overline">
              #{{ index + 1 }}
              <TopTooltip>Number</TopTooltip>
            </q-item-label>
          </template>

          <template #bezel-less>
            <q-card-section class="q-col-gutter-sm row">
              <div class="col-6">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/customers/${detail.invoice.customer.code}`"
                  icon="fal fa-user-crown"
                  :label="detail.invoice.customer.name"
                  size="sm"
                  target="_blank"
                />
              </div>

              <div v-if="!!detail.project" class="col-12">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/projects/${detail.project.urlFriendlyName}`"
                  :label="detail.project.name"
                  size="sm"
                  target="_blank"
                >
                  <template #icon>
                    <StatusIcon
                      class="q-mr-sm"
                      icon="fal fa-briefcase"
                      :status="detail.project.statusHelper"
                    />
                  </template>
                </ObjectLink>
              </div>
              <div v-else class="col-12 text-body2">
                {{ detail.invoice.content }}
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="text-caption">
              <div class="row justify-between q-gutter-x-xs">
                <div>Total</div>
                <div>
                  {{ f.currency(detail.total) }}
                </div>
              </div>
              <div class="row justify-between q-gutter-x-xs">
                <div>Total Receipt</div>
                <div>
                  {{ f.currency(detail.totalReceipt, true) }}
                </div>
              </div>
              <div class="row justify-between q-gutter-x-xs">
                <div>
                  <strong>Balance</strong>
                </div>
                <div>
                  <strong>{{ f.currency(detail.balance) }}</strong>
                </div>
              </div>
            </q-card-section>

            <template v-if="Object.keys(detail.totalReceiptByFinanceAccount).length > 0">
              <q-separator />

              <q-card-section class="text-caption">
                <q-slide-transition>
                  <div
                    v-if="
                      !content.financeAccounts
                        .filter(
                          (value) => detail.totalReceiptByFinanceAccount[value.id] !== undefined,
                        )
                        .some((value) => selectedFinanceAccounts[value.id])
                    "
                  >
                    No finance account for this invoice selected.
                  </div>
                </q-slide-transition>

                <q-slide-transition
                  v-for="financeAccount in content.financeAccounts.filter(
                    (value) => detail.totalReceiptByFinanceAccount[value.id] !== undefined,
                  )"
                  :key="financeAccount.id"
                >
                  <div
                    v-if="selectedFinanceAccounts[financeAccount.id]"
                    class="row justify-between q-gutter-x-xs"
                  >
                    <div>{{ financeAccount.name }}</div>
                    <div>
                      {{ f.currency(detail.totalReceiptByFinanceAccount[financeAccount.id]) }}
                    </div>
                  </div>
                </q-slide-transition>
              </q-card-section>
            </template>
          </template>
        </ExpandableCard>
      </template>
    </div>
  </div>
</template>
