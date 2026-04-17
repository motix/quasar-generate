<script setup lang="ts">
import { sumBy } from 'lodash-es';

import type { Expense, Project } from 'models/finance/index.js';
import type { PayableReport } from 'models/reports/index.js';

import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import usePayableReportSummary from 'composables/reports/payable/usePayableReportSummary.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{ report: PayableReport }>();

// Composables

const { financeUrl } = requiredConfigEntries('financeUrl');

const f = useFormats();

const ec = useExpenseCalculator<Expense>();

const { totalBalance } = usePayableReportSummary(props.report);

// Methods

function expenseNumber(projects: Project[], projectIndex: number, expenseIndex: number) {
  return (
    sumBy(
      projects.filter((_, index) => index < projectIndex),
      (value) => value.expenses.length,
    ) +
    expenseIndex +
    1
  );
}
</script>

<template>
  <q-list class="rounded-list">
    <q-expansion-item
      default-opened
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      label="Payable Report"
      popup
    >
      <q-card>
        <StickyHeaders markup-table separated target="#mainTable" />

        <q-markup-table id="mainTable" bordered separator="cell">
          <thead>
            <tr>
              <th class="q-table--col-auto-width">#</th>
              <th class="q-table--col-auto-width">Issue Date</th>
              <th>Expense</th>
              <th>Project / Content</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            <template v-for="(detail, detailIndex) in report" :key="detail.supplier.id">
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
                <!-- Expense -->
                <!-- Project / Content -->
                <td class="inset-shadow" colspan="3" style="white-space: normal">
                  <strong>{{ detail.supplier.name }}</strong>
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
                <!-- Expense -->
                <!-- Project / Content -->
                <!-- Balance -->
                <td colspan="5" style="height: 4px; padding: 0 !important"></td>
              </tr>

              <template v-for="(project, projectIndex) in detail.projects" :key="project.id">
                <tr v-for="(expense, expenseIndex) in project.expenses" :key="expense.id">
                  <!-- Number -->
                  <td class="text-right">
                    <div
                      v-if="projectIndex === 0 && expenseIndex === 0"
                      class="q-gutter-x-sm row justify-between items-center no-wrap"
                    >
                      <q-icon name="fal fa-briefcase" size="12px" />
                      <span>{{ 1 }}</span>
                    </div>
                    <div v-else class="text-right">
                      {{ expenseNumber(detail.projects, projectIndex, expenseIndex) }}
                    </div>
                  </td>

                  <!-- Issue Date -->
                  <td class="text-center">
                    {{ f.date(expense.issueDate) }}
                  </td>

                  <!-- Expense -->
                  <td>
                    <ObjectLink
                      color="primary"
                      :href="`${financeUrl}/project-expenses/${
                        project.urlFriendlyName
                      }/${expense.code.replaceAll('.', '_')}`"
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
                  </td>

                  <!-- Project / Content -->
                  <td>
                    <div>
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
                    </div>
                    <div>
                      {{ expense.content }}
                    </div>
                  </td>

                  <!-- Balance -->
                  <td class="text-right">
                    {{ f.currency(ec.expenseBalance(expense)) }}
                  </td>
                </tr>
              </template>

              <tr v-for="(expense, expenseIndex) in detail.generalExpenses" :key="expense.id">
                <!-- Number -->
                <td class="text-right">
                  <div
                    v-if="expenseIndex === 0"
                    class="q-gutter-x-sm row justify-between items-center no-wrap"
                  >
                    <q-icon name="fal fa-receipt" size="12px" />
                    <span>{{ expenseIndex + 1 }}</span>
                  </div>
                  <div v-else class="text-right">
                    {{ expenseIndex + 1 }}
                  </div>
                </td>

                <!-- Issue Date -->
                <td class="text-center">
                  {{ f.date(expense.issueDate) }}
                </td>

                <!-- Expense -->
                <td>
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
                </td>

                <!-- Project / Content -->
                <td>
                  {{ expense.content }}
                </td>

                <!-- Balance -->
                <td class="text-right">
                  {{ f.currency(ec.expenseBalance(expense)) }}
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
