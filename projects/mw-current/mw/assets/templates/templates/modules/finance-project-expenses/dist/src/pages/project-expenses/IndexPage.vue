<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Timestamp, where } from 'firebase/firestore';

import { sortBy, uniqBy } from 'lodash-es';

import type { ExpenseStatusName } from 'utils/finance/Expense/ExpenseStatus.js';
import { expenseStatusNames } from 'utils/finance/Expense/ExpenseStatus.js';
import type { ProjectStatusName } from 'utils/finance/Project/ProjectStatus.js';
import { projectStatusNames } from 'utils/finance/Project/ProjectStatus.js';
import stringContains from 'utils/stringContains.js';

import type { Expense, Project } from 'models/finance/index.js';

import { projectsStoreDefaultSort, useProjectsStore } from 'stores/finance/Projects.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import type { FilterOptions } from 'composables/crud-pages/useListPageFilterWithOptions.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

type ExpenseRow = {
  project: Project;
  hasExpense: boolean;
  projectLength: number;
  isLastProject: boolean;
  expense: Expense | null;
  isFirstExpense: boolean;
};

// Constants

const SCOPE_NAME = 'project-expenses-list-page';

// Options

defineOptions({ name: 'AliveIndex' });

// Private

const options: FilterOptions<'current' | number | 'archived' | 'all'>[] = [
  {
    type: 'current',
    label: 'Current Projects',
    queryConstraints: [where('isArchived', '==', false), ...projectsStoreDefaultSort],
  },
];

useSelectDateRange().yearOptions.value.forEach((year) => {
  options.push({
    type: year,
    label: year.toString(),
    selectedLabel: `${year} Projects`,
    queryConstraints: [
      where('finishDate', '>=', Timestamp.fromDate(new Date(year, 0, 1))),
      where('finishDate', '<', Timestamp.fromDate(new Date(year + 1, 0, 1))),
      ...projectsStoreDefaultSort,
    ],
  });
});

options.push(
  {
    type: 'archived',
    label: 'Archived Projects',
    queryConstraints: [where('isArchived', '==', true), ...projectsStoreDefaultSort],
  },
  {
    type: 'all',
    label: 'All Projects',
    queryConstraints: [...projectsStoreDefaultSort],
  },
);

// Composables

const router = useRouter();

const f = useFormats();

const { isTableView, isCardsView } = useMultiViews();

const mc = useExpenseCalculator<Expense>();

const $p = useListPage<Project, ExpenseRow>(SCOPE_NAME, true);
const {
  // Auto sort
  clientFilterText,
  cr,
  items,
  listItemCardWidth,
  onItemClick,
} = $p;

const { store, onLoadNextPage } = useListPageStore<Project>(
  useProjectsStore(),
  $p.loadPage,
  $p.appendItems,
  $p.updateItems,
);

const { filterLabel, filterItems, filterOptions } = useListPageFilterWithOptionsAndStore<
  Project,
  'current' | number | 'archived' | 'all'
>($p.ready, $p.queryConstraints, 'current', store, $p.loadFirstPage, $p.resetItems, ...options);

// Data

const clientFilterProjectStatus = ref<ProjectStatusName | null>(null);
const clientFilterStatus = ref<ExpenseStatusName | null>(null);
const clientFilterBalanceNotZero = ref(false);

// Computed

const projectStatusOptions = computed(() => [
  {
    label: 'All',
    value: null,
  },
  ...($p.items.value
    ? sortBy(
        uniqBy($p.items.value, (value) => value.statusHelper.statusName).map((value) => ({
          label: value.statusHelper.text,
          value: value.statusHelper.statusName,
        })),
        (value) => projectStatusNames.indexOf(value.value),
      )
    : []),
]);

const expenseStatusOptions = computed(() => [
  {
    label: 'All',
    value: null,
  },
  ...($p.items.value
    ? sortBy(
        uniqBy(
          $p.items.value.flatMap((project) => project.expenses),
          (value) => value.statusHelper.statusName,
        ).map((value) => ({
          label: value.statusHelper.text,
          value: value.statusHelper.statusName as ExpenseStatusName,
        })),
        (value) => expenseStatusNames.indexOf(value.value),
      )
    : []),
]);

// Private Executions

// useTableView
$p.columns.value = [
  {
    name: 'issueDateCreateDate',
    label: 'Issue Date / Create Date',
    align: 'center',
    field: (row) => row.expense,
    format: (val) => ({
      issueDate: f.date((val as Expense | undefined)?.issueDate),
      createDate: f.date((val as Expense | undefined)?.createDate),
    }),
    style: (row) => `${!row.hasExpense ? 'cursor: default;' : ''}`,
  },
  {
    name: 'expenseContentNotes',
    label: 'Expense / Content / Notes',
    align: 'left',
    field: (row) => row,
    classes: 'text-wrap',
  },
  {
    name: 'totalBalance',
    label: 'Total / Balance',
    align: 'right',
    field: (row) => ({
      total: row.expense ? f.currency(mc.expenseTotal(row.expense)) : undefined,
      balance: row.expense ? f.currency(mc.expenseBalance(row.expense)) : undefined,
    }),
  },
  {
    name: 'project',
    label: 'Project',
    align: 'left',
    field: 'project',
    classes: (row) =>
      `text-wrap cell-separator project-cell ${
        row.projectLength > 1 ? 'vertical-top' : ''
      } ${row.isLastProject ? 'bottom-cell' : ''}`,
    style: (row) => `${!row.hasExpense ? 'cursor: default;' : ''}`,
  },
  {
    name: 'projectFinishDate',
    label: 'Finish Date',
    align: 'center',
    field: (row) => row.project.finishDate,
    format: (val) => f.date(val as Project['finishDate']),
    classes: (row) =>
      `project-cell ${row.projectLength > 1 ? 'vertical-top' : ''} ${
        row.isLastProject ? 'bottom-cell' : ''
      }`,
    style: (row) => `${!row.hasExpense ? 'cursor: default;' : ''}`,
  },
  {
    name: 'customer',
    label: 'Customer',
    align: 'center',
    field: (row) => row.project.customer,
    classes: (row) =>
      `project-cell ${row.projectLength > 1 ? 'vertical-top' : ''} ${
        row.isLastProject ? 'bottom-cell' : ''
      }`,
    style: (row) => `max-width: 150px; ${!row.hasExpense ? 'cursor: default;' : ''}`,
  },
  {
    name: 'isArchived',
    label: 'Archived',
    align: 'center',
    field: (row) => row.project.isArchived,
    classes: (row) =>
      `project-cell ${row.projectLength > 1 ? 'vertical-top' : ''} ${
        row.isLastProject ? 'bottom-cell' : ''
      }`,
    style: (row) => `${!row.hasExpense ? 'cursor: default;' : ''}`,
  },
];
$p.buildRows.value = (items) =>
  items.flatMap((item, itemIndex) => {
    const filteredExpenses = filterExpenses(item);

    return filteredExpenses.length === 0
      ? [
          {
            project: item,
            hasExpense: false,
            projectLength: 1,
            isLastProject: itemIndex === items.length - 1,
            expense: null,
            isFirstExpense: true,
          },
        ]
      : filteredExpenses.reverse().map(
          (expense, expenseIndex) =>
            ({
              project: item,
              hasExpense: true,
              projectLength: filteredExpenses.length,
              isLastProject: itemIndex === items.length - 1,
              expense,
              isFirstExpense: expenseIndex === 0,
            }) as ExpenseRow,
        );
  });
$p.onRowClick.value = (evt: Event, row: ExpenseRow) => {
  const elm = evt.target as Element;

  if (elm.localName === 'td') {
    if (elm.classList.contains('project-cell') || !row.expense) {
      if (row.hasExpense) {
        onItemClick(evt as MouseEvent, row.project, false);
      }
    } else {
      void router.push(
        `/project-expenses/${row.project.urlFriendlyName}/${row.expense.code.replaceAll('.', '_')}`,
      );
    }
  }
};

// usePageData
$p.modelFindKeyField.value = 'urlFriendlyName';

// useClientFilter
$p.clientFilterItems.value = (items) =>
  items.filter((item) => {
    let children = [...item.expenses];

    if (
      clientFilterText.value &&
      !stringContains(item.name, clientFilterText.value) &&
      !stringContains(item.customer.name, clientFilterText.value) &&
      (children = children.filter(
        (value) =>
          stringContains(value.code, clientFilterText.value) ||
          stringContains(value.content, clientFilterText.value),
      )).length === 0
    ) {
      return false;
    }

    if (
      clientFilterProjectStatus.value &&
      item.statusHelper.statusName !== clientFilterProjectStatus.value
    ) {
      return false;
    }

    if (
      clientFilterStatus.value &&
      (children = children.filter(
        (value) => value.statusHelper.statusName === clientFilterStatus.value,
      )).length === 0
    ) {
      return false;
    }

    if (
      clientFilterBalanceNotZero.value &&
      children.filter((value) => mc.expenseBalance(value) !== 0).length === 0
    ) {
      return false;
    }

    return true;
  });

// useNavigateToViewPage
$p.viewUrl.value = '/project-expenses/';

// useNavigateToNewPage
$p.newButton.value = false;

// Methods

function filterExpenses(project: Project) {
  if (
    !clientFilterText.value ||
    stringContains(project.name, clientFilterText.value) ||
    stringContains(project.customer.name, clientFilterText.value)
  ) {
    return project.expenses.filter(
      (value) =>
        (clientFilterStatus.value === null ||
          value.statusHelper.statusName === clientFilterStatus.value) &&
        (!clientFilterBalanceNotZero.value || mc.expenseBalance(value) !== 0),
    );
  }

  return project.expenses.filter(
    (value) =>
      (stringContains(value.code, clientFilterText.value) ||
        stringContains(value.content, clientFilterText.value)) &&
      (clientFilterStatus.value === null ||
        value.statusHelper.statusName === clientFilterStatus.value) &&
      (!clientFilterBalanceNotZero.value || mc.expenseBalance(value) !== 0),
  );
}

function onProjectClick(project: Project) {
  // Wait for the ripple
  setTimeout(() => {
    void router.push(`/projects/${project.urlFriendlyName}`);
  }, 300);
}
</script>

<template>
  <QPagePadding padding>
    <ListPage :composition="$p" :scope-name="SCOPE_NAME" @load-next-page="onLoadNextPage">
      <template #top>
        <div :class="{ 'col-12': isTableView, 'q-px-md': isCardsView }">
          <div class="q-col-gutter-md row">
            <div class="col-12 col-md-auto">
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
            </div>

            <template v-if="items?.length || 0 > 0">
              <q-input
                v-model="clientFilterText"
                class="col-12 col-md"
                clearable
                debounce="300"
                dense
                hide-bottom-space
                label="Project Name, Customer, Code, Content"
              />

              <q-select
                v-model="clientFilterProjectStatus"
                class="col-12 col-md-2"
                dense
                emit-value
                hide-bottom-space
                label="Project Status"
                map-options
                :options="projectStatusOptions"
              />

              <q-select
                v-model="clientFilterStatus"
                class="col-12 col-md-2"
                dense
                emit-value
                hide-bottom-space
                label="Status"
                map-options
                :options="expenseStatusOptions"
              />

              <q-toggle
                v-model="clientFilterBalanceNotZero"
                checked-icon="fal fa-check"
                color="primary"
                icon-color="white"
                label="Balance Not Zero"
                unchecked-icon="clear"
              >
              </q-toggle>
            </template>
          </div>
        </div>
      </template>

      <template #header-cell-issueDateCreateDate="{ props }">
        <q-th :props="props">
          Issue Date<br />
          <span class="text-caption">Create Date</span>
        </q-th>
      </template>
      <template #body-cell-issueDateCreateDate="{ props }">
        <q-td
          :auto-width="!!cr(props.row).expense"
          :colspan="cr(props.row).expense ? 1 : 3"
          :props="props"
        >
          <template v-if="!cr(props.row).expense"> This project has no expense. </template>

          <template v-else>
            <div>
              {{ props.value.issueDate }}
              <TopTooltip>Issue Date</TopTooltip>
            </div>
            <div class="text-caption">
              {{ props.value.createDate }}
              <TopTooltip>Create Date</TopTooltip>
            </div>
          </template>
        </q-td>
      </template>
      <template #header-cell-expenseContentNotes="{ props }">
        <q-th :props="props">
          Expense<br />
          <span class="text-caption">Content</span> /
          <span class="text-caption text-italic">Notes</span>
        </q-th>
      </template>
      <template #body-cell-expenseContentNotes="{ props }">
        <q-td v-if="!!cr(props.row).expense" :props="props">
          <div>
            <ObjectLink
              color="primary"
              :label="cr(props.row).expense!.code"
              :to="`/project-expenses/${
                cr(props.row).project.urlFriendlyName
              }/${cr(props.row).expense!.code.replaceAll('.', '_')}`"
            >
              <template #icon>
                <StatusIcon
                  class="q-mr-sm"
                  icon="fal fa-receipt"
                  :status="cr(props.row).expense!.statusHelper"
                />
              </template>
            </ObjectLink>
          </div>
          <div class="text-caption">
            {{ cr(props.row).expense!.content }}
          </div>
          <div
            v-if="cr(props.row).expense!.notes !== undefined"
            class="text-caption text-italic q-mt-xs"
            :class="{
              'bg-negative text-white q-px-sm q-py-xs rounded-borders shadow-2': cr(
                props.row,
              ).expense!.notes!.startsWith('!'),
            }"
          >
            {{ cr(props.row).expense!.notes }}
          </div>
        </q-td>
      </template>
      <template #header-cell-totalBalance="{ props }">
        <q-th :props="props">
          Total<br />
          <span class="text-caption">Balance</span>
        </q-th>
      </template>
      <template #body-cell-totalBalance="{ props }">
        <q-td v-if="!!cr(props.row).expense" :props="props">
          <div>
            {{ props.value.total }}
            <TopTooltip>Total</TopTooltip>
          </div>
          <div class="text-caption">
            {{ props.value.balance }}
            <TopTooltip>Balance</TopTooltip>
          </div>
        </q-td>
      </template>
      <template #body-cell-project="{ props }">
        <q-td
          v-if="cr(props.row).isFirstExpense"
          :props="props"
          :rowspan="cr(props.row).projectLength"
        >
          <ObjectLink
            color="primary"
            :label="props.value.name"
            :to="`/projects/${props.value.urlFriendlyName}`"
            wrap-label
          >
            <template #icon>
              <StatusIcon
                class="q-mr-sm"
                icon="fal fa-briefcase"
                :status="props.value.statusHelper"
              />
            </template>
          </ObjectLink>
        </q-td>
      </template>
      <template #body-cell-projectFinishDate="{ props }">
        <q-td
          v-if="cr(props.row).isFirstExpense"
          :props="props"
          :rowspan="cr(props.row).projectLength"
        >
          {{ props.value }}
        </q-td>
      </template>
      <template #body-cell-customer="{ props }">
        <q-td
          v-if="cr(props.row).isFirstExpense"
          :props="props"
          :rowspan="cr(props.row).projectLength"
        >
          <ObjectLink
            color="primary"
            :label="props.value.name"
            :to="`/customers/${props.value.code}`"
          />
        </q-td>
      </template>
      <template #body-cell-isArchived="{ props }">
        <q-td
          v-if="cr(props.row).isFirstExpense"
          auto-width
          :props="props"
          :rowspan="cr(props.row).projectLength"
        >
          <q-toggle
            v-model="props.value"
            checked-icon="fal fa-box-taped"
            color="primary"
            disable
            unchecked-icon="fal fa-box-open"
          />
        </q-td>
      </template>

      <template #item-card="{ model, link }">
        <ExpandableCard
          clickable
          :external-link-url="
            filterExpenses(model).length > 0 ? link() : `/projects/${model.urlFriendlyName}`
          "
          header-separator
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="f.date(model.finishDate) || undefined"
          subtitle-tooltip="Finish Date"
          :title="model.name"
          title-full-width
          @click="
            filterExpenses(model).length === 0
              ? onProjectClick(model)
              : onItemClick($event, model, true)
          "
        >
          <template #main>
            <StatusBadge class="q-mt-sm" :status="model.statusHelper" />
          </template>

          <template #side>
            <q-toggle
              v-model="model.isArchived"
              checked-icon="fal fa-box-taped"
              class="right-toggle"
              color="primary"
              disable
              unchecked-icon="fal fa-box-open"
            >
              <TopTooltip>Archived</TopTooltip>
            </q-toggle>
          </template>

          <template #bezel-less>
            <q-card-section>
              <ObjectLink
                color="primary"
                icon="fal fa-user-crown"
                :label="model.customer.name"
                size="sm"
                :to="`/customers/${model.customer.code}`"
              />
            </q-card-section>

            <q-separator />

            <q-card-section
              class="text-caption"
              :class="{
                'q-gutter-y-xs': filterExpenses(model).length > 0,
              }"
            >
              <template v-if="filterExpenses(model).length === 0">
                This project has no expense.
              </template>

              <template v-else>
                <div
                  v-for="expense in filterExpenses(model).reverse()"
                  :key="expense.code"
                  class="row q-col-gutter-x-xs"
                >
                  <div class="col-3">
                    <div>
                      {{ f.date(expense.issueDate) }}
                      <TopTooltip>Issue Date</TopTooltip>
                    </div>
                    <div class="text-muted">
                      {{ f.date(expense.createDate) }}
                      <TopTooltip>Create Date</TopTooltip>
                    </div>
                  </div>

                  <div class="col-5">
                    <div>
                      <ObjectLink
                        color="primary"
                        :label="expense.code"
                        size="sm"
                        :to="`/project-expenses/${
                          model.urlFriendlyName
                        }/${expense.code.replaceAll('.', '_')}`"
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
                    <div>
                      {{ expense.content }}
                    </div>
                    <div
                      v-if="expense.notes !== undefined"
                      class="text-caption text-italic q-mt-xs"
                      :class="{
                        'bg-negative text-white q-px-sm q-py-xs rounded-borders shadow-2':
                          expense.notes.startsWith('!'),
                      }"
                    >
                      {{ expense.notes }}
                    </div>
                  </div>

                  <div class="col-4 text-right">
                    <div>
                      {{ f.currency(mc.expenseTotal(expense)) }}
                      <TopTooltip>Total</TopTooltip>
                    </div>
                    <div class="text-muted">
                      {{ f.currency(mc.expenseBalance(expense)) }}
                      <TopTooltip>Balance</TopTooltip>
                    </div>
                  </div>
                </div>
              </template>
            </q-card-section>
          </template>
        </ExpandableCard>
      </template>
    </ListPage>
  </QPagePadding>
</template>

<style lang="scss" scoped>
.cell-separator {
  border-left: 1px solid $table-border-color;
}

.q-table--dark .cell-separator {
  border-left-color: $table-dark-border-color;
}

.bottom-cell {
  border-bottom: 0px;
}
</style>
