<script setup lang="ts">
import type { Invoice, Project } from 'models/finance/index.js';
import type { ReceivableReport } from 'models/reports/index.js';

import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';
import useProjectCalculator from 'composables/reports/project/useProjectCalculator.js';
import useReceivableReportSummary from 'composables/reports/receivable/useReceivableReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Props

const props = defineProps<{ report: ReceivableReport }>();

// Composables

const { cardWidth, listItemCardWidth, financeUrl } = requiredConfigEntries(
  'cardWidth',
  'listItemCardWidth',
  'financeUrl',
);

const f = useFormats();

const pc = useProjectCalculator();
const ic = useInvoiceCalculator<Invoice>();

const { totalBalance } = useReceivableReportSummary(props.report);

// Methods

function findInvoice(project: Project) {
  return (project.quotations.find(
    (quotation) =>
      !!quotation.invoice && quotation.invoice.isCompleted && !quotation.invoice.isCancelled,
  ) ||
    project.quotations.find(
      (quotation) => !!quotation.invoice && quotation.invoice.transactions.length > 0,
    ))!.invoice!;
}
</script>

<template>
  <div>
    <div class="row items-start justify-evenly q-gutter-md">
      <q-card class="bg-accent" dark style="width: 100%" :style="{ maxWidth: cardWidth + 'px' }">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-center">Receivable Report</div>
        </q-card-section>

        <q-card-section>
          <div class="row justify-between">
            <div>Balance</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(totalBalance) }}
              </strong>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="flex-break q-mt-none"></div>

      <ExpandableCard
        v-for="(detail, index) in report"
        :key="detail.customer.id"
        body-class="text-caption q-gutter-y-xs"
        header-separator
        side-top
        :style="{ maxWidth: listItemCardWidth + 'px' }"
        :title="detail.customer.name"
      >
        <template #side>
          <q-item-label caption class="text-overline">
            #{{ index + 1 }}
            <TopTooltip>Number</TopTooltip>
          </q-item-label>

          <q-item-label class="text-accent">
            <strong>
              {{ f.currency(detail.balance) }}
            </strong>
          </q-item-label>
        </template>

        <template #body>
          <template v-for="(project, projectIndex) in detail.projects" :key="project.id">
            <div v-if="projectIndex === 0">
              <q-icon name="fal fa-briefcase" size="12px" />
            </div>
            <div class="row q-col-gutter-x-xs">
              <div class="col-3">
                {{ f.date(findInvoice(project).issueDate) }}
              </div>

              <div class="col-5">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/project-invoices/${
                    project.urlFriendlyName
                  }/${findInvoice(project).code.replaceAll('.', '_')}`"
                  :label="findInvoice(project).code"
                  size="sm"
                  target="_blank"
                >
                  <template #icon>
                    <StatusIcon
                      class="q-mr-sm"
                      icon="fal fa-file-invoice-dollar"
                      :status="findInvoice(project).statusHelper"
                    />
                  </template>
                </ObjectLink>
              </div>

              <div class="col-4 text-right">
                {{ f.currency(pc.projectBalance(project)) }}
              </div>
            </div>
            <div class="row q-col-gutter-x-xs">
              <div class="col-9 offset-3">
                <q-icon class="text-muted" name="fal fa-arrow-turn-up fa-flip-horizontal" />
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/projects/${project.urlFriendlyName}`"
                  :label="project.name"
                  size="sm"
                  target="_blank"
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
              </div>
            </div>
          </template>

          <template v-for="(invoice, invoiceIndex) in detail.generalInvoices" :key="invoice.id">
            <div v-if="invoiceIndex === 0">
              <q-icon name="fal fa-file-invoice-dollar" size="12px" />
            </div>
            <div class="row q-col-gutter-x-xs">
              <div class="col-3">
                {{ f.date(invoice.issueDate) }}
              </div>

              <div class="col-5">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/general-invoices/${invoice.code.replaceAll('.', '_')}`"
                  :label="invoice.code"
                  target="_blank"
                >
                  <template #icon>
                    <StatusIcon
                      class="q-mr-sm"
                      icon="fal fa-file-invoice-dollar"
                      :status="invoice.statusHelper"
                    />
                  </template>
                </ObjectLink>
              </div>

              <div class="col-4 text-right">
                {{ f.currency(ic.invoiceBalance(invoice)) }}
              </div>
            </div>
            <div class="row q-col-gutter-x-xs">
              <div class="col-9 offset-3">
                {{ invoice.content }}
              </div>
            </div>
          </template>
        </template>
      </ExpandableCard>
    </div>
  </div>
</template>
