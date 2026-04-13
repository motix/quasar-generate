<script setup lang="ts">
import type { Expense } from 'models/finance/index.js';
import type { PayableReport } from 'models/reports/index.js';

import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import usePayableReportSummary from 'composables/reports/payable/usePayableReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Props

const props = defineProps<{ report: PayableReport }>();

// Composables

const { cardWidth, listItemCardWidth, financeUrl } = requiredConfigEntries(
  'cardWidth',
  'listItemCardWidth',
  'financeUrl',
);

const f = useFormats();

const ec = useExpenseCalculator<Expense>();

const { totalBalance } = usePayableReportSummary(props.report);
</script>

<template>
  <div>
    <div class="row items-start justify-evenly q-gutter-md">
      <q-card class="bg-accent" dark style="width: 100%" :style="{ maxWidth: cardWidth + 'px' }">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-center">Payable Report</div>
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
        :key="detail.supplier.id"
        body-class="text-caption q-gutter-y-xs"
        header-separator
        side-top
        :style="{ maxWidth: listItemCardWidth + 'px' }"
        :title="detail.supplier.name"
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
            <template v-for="(expense, expenseIndex) in project.expenses" :key="expense.id">
              <div v-if="projectIndex === 0 && expenseIndex === 0">
                <q-icon name="fal fa-briefcase" size="12px" />
              </div>
              <div class="row q-col-gutter-x-xs">
                <div class="col-3">
                  {{ f.date(expense.issueDate) }}
                </div>

                <div class="col-5">
                  <ObjectLink
                    color="primary"
                    :href="`${financeUrl}/project-expenses/${
                      project.urlFriendlyName
                    }/${expense.code.replaceAll('.', '_')}`"
                    :label="expense.code"
                    size="sm"
                    target="_blank"
                  >
                    <template #icon>
                      <StatusIcon
                        class="q-mr-sm"
                        icon="fal fa-receipt"
                        :status="expense.statusHelper"
                      />
                    </template>
                  </ObjectLink>
                </div>

                <div class="col-4 text-right">
                  {{ f.currency(ec.expenseBalance(expense)) }}
                </div>
              </div>
              <div class="row q-col-gutter-x-xs">
                <div class="col-9 offset-3">
                  <div>
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
                  <div>
                    {{ expense.content }}
                  </div>
                </div>
              </div>
            </template>
          </template>

          <template v-for="(expense, expenseIndex) in detail.generalExpenses" :key="expense.id">
            <div v-if="expenseIndex === 0">
              <q-icon name="fal fa-receipt" size="12px" />
            </div>
            <div class="row q-col-gutter-x-xs">
              <div class="col-3">
                {{ f.date(expense.issueDate) }}
              </div>

              <div class="col-5">
                <ObjectLink
                  color="primary"
                  :href="`${financeUrl}/general-expenses/${expense.code.replaceAll('.', '_')}`"
                  :label="expense.code"
                  target="_blank"
                >
                  <template #icon>
                    <StatusIcon
                      class="q-mr-sm"
                      icon="fal fa-receipt"
                      :status="expense.statusHelper"
                    />
                  </template>
                </ObjectLink>
              </div>

              <div class="col-4 text-right">
                {{ f.currency(ec.expenseBalance(expense)) }}
              </div>
            </div>
            <div class="row q-col-gutter-x-xs">
              <div class="col-9 offset-3">
                {{ expense.content }}
              </div>
            </div>
          </template>
        </template>
      </ExpandableCard>
    </div>
  </div>
</template>
