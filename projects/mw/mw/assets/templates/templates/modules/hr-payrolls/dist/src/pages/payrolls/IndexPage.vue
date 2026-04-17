<script setup lang="ts">
import { where } from 'firebase/firestore';

import type { Payroll } from 'models/hr/index.js';

import { payrollsStoreDefaultSort, usePayrollsStore } from 'stores/hr/Payrolls.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import type { FilterOptions } from 'composables/crud-pages/useListPageFilterWithOptions.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import usePayrollCalculator from 'composables/hr/payroll/usePayrollCalculator.js';
import useFormats from 'composables/useFormats.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Constants

const SCOPE_NAME = 'payrolls-list-page';

// Options

defineOptions({ name: 'AliveIndex' });

// Private

const options: FilterOptions<number | 'all'>[] = useSelectDateRange().yearOptions.value.map(
  (year) => ({
    type: year,
    label: year.toString(),
    selectedLabel: `${year} Payrolls`,
    queryConstraints: [
      where('year', '==', year),
      ...payrollsStoreDefaultSort.filter((_value, index) => index > 0),
    ],
  }),
);

options.push({
  type: 'all',
  label: 'All Payrolls',
  queryConstraints: [...payrollsStoreDefaultSort],
});

// Composables

const f = useFormats();

const mc = usePayrollCalculator<Payroll>();

const $p = useListPage<Payroll, Payroll>(SCOPE_NAME, true);
const {
  // Auto sort
  cr,
  listItemCardWidth,
  itemLink,
  onItemClick,
} = $p;

const { store, onLoadNextPage } = useListPageStore<Payroll>(
  usePayrollsStore(),
  $p.loadPage,
  $p.appendItems,
  $p.updateItems,
);

const { filterLabel, filterItems, filterOptions } = useListPageFilterWithOptionsAndStore<
  Payroll,
  number | 'all'
>(
  $p.ready,
  $p.queryConstraints,
  new Date().getFullYear(),
  store,
  $p.loadFirstPage,
  $p.resetItems,
  ...options,
);

// Private Executions

// useTableView
$p.columns.value = [
  {
    name: 'code',
    label: 'Code',
    align: 'center',
    field: 'code',
  },
  {
    name: 'year',
    label: 'Year',
    align: 'center',
    field: 'year',
  },
  {
    name: 'month',
    label: 'Month',
    align: 'center',
    field: 'month',
  },
  {
    name: 'status',
    label: 'Status',
    align: 'center',
    field: 'statusHelper',
  },
  {
    name: 'workingDays',
    label: 'Working Days',
    align: 'center',
    field: 'workingDays',
  },
  {
    name: 'totalNetSalary',
    label: 'Total Net Salary',
    align: 'right',
    field: (row) => f.currency(mc.payrollTotalNetSalary(row)),
  },
  {
    name: 'totalPayable',
    label: 'Total Payable',
    align: 'right',
    field: (row) => f.currency(mc.payrollTotalPayable(row)),
  },
];

// usePageData
$p.modelFindKeyField.value = 'code';

// useNavigateToViewPage
$p.viewUrl.value = '/payrolls/';

// useNavigateToNewPage
$p.newUrl.value = '/payrolls/new';
</script>

<template>
  <QPagePadding padding>
    <ListPage :composition="$p" :scope-name="SCOPE_NAME" @load-next-page="onLoadNextPage">
      <template #top>
        <q-btn-dropdown color="accent" :label="filterLabel" rounded>
          <q-list>
            <q-item
              v-for="option in filterOptions"
              :key="option.type"
              clickable
              :disable="option.selected"
              :v-close-popup="!option.selected"
              @click="filterItems(option.type)"
            >
              <q-item-section>
                <q-item-label>{{ option.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>

      <template #body-cell-code="{ props }">
        <q-td :props="props">
          <ObjectLink color="primary" :label="props.value" :to="itemLink(cr(props.row))">
            <template #icon>
              <StatusIcon
                class="q-mr-sm"
                icon="fal fa-money-bill fa-fw"
                :status="cr(props.row).statusHelper"
              />
            </template>
          </ObjectLink>
        </q-td>
      </template>
      <template #body-cell-status="{ props }">
        <q-td auto-width :props="props">
          <StatusBadge :status="props.value" />
        </q-td>
      </template>

      <template #item-card="{ model, link }">
        <ExpandableCard
          clickable
          :external-link-url="link()"
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :title="model.code"
          title-no-wrap
          title-top
          @click="onItemClick($event, model, true)"
        >
          <template #main>
            <StatusBadge class="q-mt-sm" :status="model.statusHelper" />
          </template>

          <template #side>
            <q-item-label caption>
              {{ f.yearMonth(model.year, model.month) }}
            </q-item-label>
            <q-item-label caption>
              {{ `${model.workingDays} working day${model.workingDays > 1 ? 's' : ''}` }}
            </q-item-label>
            <q-item-label caption>
              Total net salary {{ f.currency(mc.payrollTotalNetSalary(model)) }}
            </q-item-label>
            <q-item-label caption>
              Total payable {{ f.currency(mc.payrollTotalPayable(model)) }}
            </q-item-label>
          </template>
        </ExpandableCard>
      </template>
    </ListPage>
  </QPagePadding>
</template>
