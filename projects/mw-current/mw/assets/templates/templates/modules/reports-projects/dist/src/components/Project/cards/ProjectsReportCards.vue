<script setup lang="ts">
import type { Project } from 'models/finance/index.js';

import useProjectCalculator from 'composables/reports/project/useProjectCalculator.js';
import useProjectsReportSummary from 'composables/reports/project/useProjectsReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

// Props

const props = defineProps<{
  reportTitle: string;
  projects: Project[];
}>();

// Composables

const { cardWidth, listItemCardWidth, financeUrl } = requiredConfigEntries(
  'cardWidth',
  'listItemCardWidth',
  'financeUrl',
);

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
            <div>Projects</div>
            <div class="text-warning">
              <strong>
                {{ projects.length }}
              </strong>
            </div>
          </div>
        </q-card-section>

        <q-separator dark inset />

        <q-card-section>
          <div class="row justify-between">
            <div>Total VAT Excluded Invoice</div>
            <div class="text-warning">
              {{ f.currency(totalVatExcludedInvoice) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total Production Salary</div>
            <div class="text-warning">
              {{ f.currency(totalProductionSalary, true) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total Expense</div>
            <div class="text-warning">
              {{ f.currency(totalExpense, true) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total Profit</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(totalProfit) }}
              </strong>
            </div>
          </div>
        </q-card-section>

        <q-separator dark inset />

        <q-card-section>
          <div class="row justify-between">
            <div>Total VAT Included Invoice</div>
            <div class="text-warning">
              {{ f.currency(totalInvoice) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total Received</div>
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
      </q-card>

      <div class="flex-break q-mt-none"></div>

      <ExpandableCard
        v-for="(project, index) in projects"
        :key="project.id"
        :external-link-url="`${financeUrl}/projects/${project.urlFriendlyName}`"
        header-separator
        side-top
        :style="{ maxWidth: listItemCardWidth + 'px' }"
        :subtitle="f.date(project.finishDate) || undefined"
        subtitle-tooltip="Finish Date"
        :title="project.name"
        title-full-width
      >
        <template #main>
          <StatusBadge class="q-mt-md" :status="project.statusHelper" />
        </template>

        <template #side>
          <q-item-label caption class="text-overline">
            #{{ index + 1 }}
            <TopTooltip>Number</TopTooltip>
          </q-item-label>

          <q-toggle
            v-model="project.isInvoiceRequired"
            checked-icon="fal fa-file-invoice-dollar"
            class="right-toggle"
            color="primary"
            disable
            unchecked-icon="clear"
          >
            <TopTooltip>Invoice Required</TopTooltip>
          </q-toggle>
        </template>

        <template #bezel-less>
          <q-card-section>
            <ObjectLink
              color="primary"
              :href="`${financeUrl}/customers/${project.customer.code}`"
              icon="fal fa-user-crown"
              :label="project.customer.name"
              size="sm"
              target="_blank"
            />
          </q-card-section>

          <q-separator />

          <q-card-section class="text-caption">
            <div class="row justify-between q-gutter-x-xs">
              <div>VAT Excluded Invoice</div>
              <div>
                {{ f.currency(mc.projectTotalVatExcludedInvoice(project)) }}
              </div>
            </div>
            <div class="row justify-between no-wrap q-gutter-x-sm">
              <div>Production Salary</div>
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

            <q-separator spaced />

            <div class="row justify-between q-gutter-x-sm">
              <div>VAT Included Invoice</div>
              <div>
                {{ f.currency(mc.projectTotalInvoice(project)) }}
              </div>
            </div>
            <div class="row justify-between q-gutter-x-sm">
              <div>Received</div>
              <div>
                {{ f.currency(mc.projectTotalReceipt(project), true) }}
              </div>
            </div>
            <div class="row justify-between q-gutter-x-sm">
              <div>
                <strong>Balance</strong>
              </div>
              <div>
                <strong>{{ f.currency(mc.projectBalance(project)) }}</strong>
              </div>
            </div>
          </q-card-section>
        </template>
      </ExpandableCard>
    </div>
  </div>
</template>
