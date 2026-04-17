<script setup lang="ts">
import type { Project } from 'models/finance/index.js';

import useProjectCalculator from 'composables/reports/project/useProjectCalculator.js';
import useProjectsReportSummary from 'composables/reports/project/useProjectsReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{
  reportTitle: string;
  projects: Project[];
}>();

// Composables

const { financeUrl } = requiredConfigEntries('financeUrl');

const f = useFormats();

const mc = useProjectCalculator();

const {
  totalVatExcludedInvoice,
  totalProductionSalary,
  totalExpense,
  totalProfit,
  totalInvoice,
  totalReceipt,
  totalBalance,
} = useProjectsReportSummary(props.projects);
</script>

<template>
  <q-list class="rounded-list">
    <q-expansion-item
      default-opened
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      :label="reportTitle"
      popup
    >
      <q-card>
        <StickyHeaders markup-table separated target="#mainTable" />

        <q-markup-table id="mainTable" bordered separator="cell">
          <thead>
            <tr>
              <th class="q-table--col-auto-width">#</th>
              <th class="q-table--col-auto-width">Finish Date</th>
              <th>Customer</th>
              <th>Name</th>
              <th class="q-table--col-auto-width">Status</th>
              <th class="q-table--col-auto-width">Invoice Required</th>
              <th>Profit</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(project, index) in projects" :key="project.id">
              <!-- Number -->
              <td class="text-right">
                {{ index + 1 }}
              </td>

              <!-- Finish Date -->
              <td class="text-center">
                {{ f.date(project.finishDate) }}
              </td>

              <!-- Customer -->
              <td class="text-center text-wrap">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/customers/${project.customer.code}`"
                  :label="project.customer.name"
                  target="_blank"
                  wrap-label
                />
              </td>

              <!-- Name -->
              <td class="text-wrap">
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

              <!-- Status -->
              <td class="text-center">
                <StatusBadge class="q-mt-sm" :status="project.statusHelper" />
              </td>

              <!-- Invoice Required -->
              <td class="text-center">
                <q-toggle
                  v-model="project.isInvoiceRequired"
                  checked-icon="fal fa-check"
                  color="primary"
                  disable
                  unchecked-icon="clear"
                />
              </td>

              <!-- Profit -->
              <td>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>VAT Ecl. Invoice</div>
                  <div>
                    {{ f.currency(mc.projectTotalVatExcludedInvoice(project)) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>Production Slr.</div>
                  <div>
                    {{ f.currency(mc.projectTotalProductionSalary(project), true) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>Expense</div>
                  <div>
                    {{ f.currency(mc.projectTotalExpense(project), true) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>
                    <strong>Profit</strong>
                  </div>
                  <div>
                    <strong>{{ f.currency(mc.projectProfit(project)) }}</strong>
                  </div>
                </div>
              </td>

              <!-- Balance -->
              <td>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>VAT Icl. Invoice</div>
                  <div>
                    {{ f.currency(mc.projectTotalInvoice(project)) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>Received</div>
                  <div>
                    {{ f.currency(mc.projectTotalReceipt(project), true) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>
                    <strong>Balance</strong>
                  </div>
                  <div>
                    <strong>{{ f.currency(mc.projectBalance(project)) }}</strong>
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <!-- Number -->
              <!-- Finish Date -->
              <!-- Customer -->
              <th class="text-right" colspan="3">Total</th>

              <!-- Name -->
              <th class="text-right" style="white-space: nowrap">
                <span class="text-caption text-muted">Projects: </span>
                {{ projects.length }}
              </th>

              <!-- Status -->
              <th></th>

              <!-- Invoice Required -->
              <th></th>

              <!-- Profit -->
              <th>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>VAT Ecl. Invoice</div>
                  <div>
                    {{ f.currency(totalVatExcludedInvoice) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>Production Slr.</div>
                  <div>
                    {{ f.currency(totalProductionSalary, true) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>Expense</div>
                  <div>
                    {{ f.currency(totalExpense, true) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>
                    <strong>Profit</strong>
                  </div>
                  <div>
                    <strong>{{ f.currency(totalProfit) }}</strong>
                  </div>
                </div>
              </th>

              <!-- Balance -->
              <th>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>VAT Icl. Invoice</div>
                  <div>
                    {{ f.currency(totalInvoice) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>Received</div>
                  <div>
                    {{ f.currency(totalReceipt, true) }}
                  </div>
                </div>
                <div class="row justify-between no-wrap q-gutter-x-sm">
                  <div>
                    <strong>Balance</strong>
                  </div>
                  <div>
                    <strong>{{ f.currency(totalBalance) }}</strong>
                  </div>
                </div>
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
