<script setup lang="ts">
import type { Invoice, Project } from 'models/finance/index.js';
import type { ReceivableReport } from 'models/reports/index.js';

import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';
import useProjectCalculator from 'composables/reports/project/useProjectCalculator.js';
import useReceivableReportSummary from 'composables/reports/receivable/useReceivableReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{ report: ReceivableReport }>();

// Composables

const { financeUrl } = requiredConfigEntries('financeUrl');

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
  <q-list class="rounded-list">
    <q-expansion-item
      default-opened
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      label="Receivable Report"
      popup
    >
      <q-card>
        <StickyHeaders markup-table separated target="#mainTable" />

        <q-markup-table id="mainTable" bordered separator="cell">
          <thead>
            <tr>
              <th class="q-table--col-auto-width">#</th>
              <th class="q-table--col-auto-width">Issue Date</th>
              <th>Invoice</th>
              <th>Project / Content</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            <template v-for="(detail, detailIndex) in report" :key="detail.customer.id">
              <tr>
                <!-- Number -->
                <td class="inset-shadow">
                  <strong>
                    <ol :start="detailIndex + 1" type="I">
                      <li></li>
                    </ol>
                  </strong>
                </td>

                <!-- Issue Date -->
                <!-- Invoice -->
                <!-- Project / Content -->
                <td class="inset-shadow" colspan="3" style="white-space: normal">
                  <strong>{{ detail.customer.name }}</strong>
                </td>

                <!-- Balance -->
                <td class="inset-shadow text-right">
                  <strong>
                    {{ f.currency(detail.balance) }}
                  </strong>
                </td>
              </tr>

              <!-- Separator -->
              <tr>
                <!-- Number -->
                <!-- Issue Date -->
                <!-- Invoice -->
                <!-- Project / Content -->
                <!-- Balance -->
                <td colspan="5" style="height: 4px; padding: 0 !important"></td>
              </tr>

              <tr v-for="(project, projectIndex) in detail.projects" :key="project.id">
                <!-- Number -->
                <td class="text-right">
                  <div
                    v-if="projectIndex === 0"
                    class="q-gutter-x-sm row justify-between items-center no-wrap"
                  >
                    <q-icon name="fal fa-briefcase" size="12px" />
                    <span>1</span>
                  </div>
                  <div v-else class="text-right">
                    {{ projectIndex + 1 }}
                  </div>
                </td>

                <!-- Issue Date -->
                <td class="text-center">
                  {{ f.date(findInvoice(project).issueDate) }}
                </td>

                <!-- Invoice -->
                <td>
                  <ObjectLink
                    color="primary"
                    :href="`${financeUrl}/project-invoices/${
                      project.urlFriendlyName
                    }/${findInvoice(project).code.replaceAll('.', '_')}`"
                    :label="findInvoice(project).code"
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
                </td>

                <!-- Project / Content -->
                <td>
                  <ObjectLink
                    color="primary"
                    :href="`${financeUrl}/projects/${project.urlFriendlyName}`"
                    :label="project.name"
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
                </td>

                <!-- Balance -->
                <td class="text-right">
                  {{ f.currency(pc.projectBalance(project)) }}
                </td>
              </tr>

              <tr v-for="(invoice, invoiceIndex) in detail.generalInvoices" :key="invoice.id">
                <!-- Number -->
                <td class="text-right">
                  <div
                    v-if="invoiceIndex === 0"
                    class="q-gutter-x-sm row justify-between items-center no-wrap"
                  >
                    <q-icon name="fal fa-file-invoice-dollar" size="12px" />
                    <span>{{ invoiceIndex + 1 }}</span>
                  </div>
                  <div v-else class="text-right">
                    {{ invoiceIndex + 1 }}
                  </div>
                </td>

                <!-- Issue Date -->
                <td class="text-center">
                  {{ f.date(invoice.issueDate) }}
                </td>

                <!-- Invoice -->
                <td>
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
                </td>

                <!-- Project / Content -->
                <td>
                  {{ invoice.content }}
                </td>

                <!-- Balance -->
                <td class="text-right">
                  {{ f.currency(ic.invoiceBalance(invoice)) }}
                </td>
              </tr>
            </template>

            <tr>
              <th class="text-right" colspan="4">Total</th>
              <th class="text-right">
                <strong>
                  {{ f.currency(totalBalance) }}
                </strong>
              </th>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<style scoped lang="scss">
table {
  th,
  td {
    font-size: 0.85rem;
  }
}

thead th {
  white-space: normal;
}
</style>
