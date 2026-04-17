<script setup lang="ts">
import { Timestamp, where } from 'firebase/firestore';

import stringContains from 'utils/stringContains.js';

import type { Todo } from 'models/production/index.js';

import { todosStoreDefaultSort, useTodosStore } from 'stores/production/Todos.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import type { FilterOptions } from 'composables/crud-pages/useListPageFilterWithOptions.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import useCurrentMember from 'composables/production/shared/useCurrentMember.js';
import useTodoVisibleToUser from 'composables/production/todo/useTodoVisibleToUser.js';
import useTaskCalculator from 'composables/tasks/task/useTaskCalculator.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import TaskAssignedTo from 'components/Task/TaskAssignedTo.vue';

// Constants

const SCOPE_NAME = 'todos-list-page';

// Options

defineOptions({ name: 'AliveIndex' });

// Private

const options: FilterOptions<'current' | number | 'archived' | 'all'>[] = [
  {
    type: 'current',
    label: 'Current Todos',
    queryConstraints: [where('isArchived', '==', false), ...todosStoreDefaultSort],
  },
];

useSelectDateRange().yearOptions.value.forEach((year) => {
  options.push({
    type: year,
    label: year.toString(),
    selectedLabel: `${year} Todos`,
    queryConstraints: [
      where('dueDate', '>=', Timestamp.fromDate(new Date(year, 0, 1))),
      where('dueDate', '<', Timestamp.fromDate(new Date(year + 1, 0, 1))),
      ...todosStoreDefaultSort,
    ],
  });
});

options.push(
  {
    type: 'archived',
    label: 'Archived Todos',
    queryConstraints: [where('isArchived', '==', true), ...todosStoreDefaultSort],
  },
  {
    type: 'all',
    label: 'All Todos',
    queryConstraints: [...todosStoreDefaultSort],
  },
);

// Composables

const f = useFormats();

const { isTableView, isCardsView } = useMultiViews();

const { hasRole } = useFirebaseAuth();

const { authenticatedMember } = useCurrentMember();
const { todoVisibleToUser } = useTodoVisibleToUser(authenticatedMember);

const mc = useTaskCalculator();

const $p = useListPage<Todo, Todo>(SCOPE_NAME, true);
const {
  // Auto sort
  clientFilterText,
  cr,
  items,
  listItemCardWidth,
  onItemClick,
} = $p;

const { store, onLoadNextPage } = useListPageStore<Todo>(
  useTodosStore(),
  $p.loadPage,
  // appendItems
  (newItems: Todo[]) => {
    $p.appendItems(newItems.filter((value) => todoVisibleToUser(value)));
  },
  // updateItems
  (recentlyAddedDocs: Todo[], recentlyUpdatedDocs: Todo[], recentlyDeletedDocs: string[]) => {
    $p.updateItems(
      recentlyAddedDocs.filter((value) => todoVisibleToUser(value)),
      recentlyUpdatedDocs,
      [
        ...recentlyDeletedDocs,
        ...recentlyUpdatedDocs
          .filter((value) => !todoVisibleToUser(value))
          .map((value) => value.id),
      ],
    );
  },
);

const { filterLabel, filterItems, filterOptions } = useListPageFilterWithOptionsAndStore<
  Todo,
  'current' | number | 'archived' | 'all'
>(
  $p.ready,
  $p.queryConstraints,
  'current',
  store,
  $p.loadFirstPage,
  // resetItems
  (newItems: Todo[]) => {
    $p.resetItems(newItems.filter((value) => todoVisibleToUser(value)));
  },
  ...options,
);

// Private Executions

// useTableView
$p.columns.value = [
  {
    name: 'dueDate',
    label: 'Due Date',
    align: 'center',
    field: 'dueDate',
    format: (val) => f.date(val as Todo['dueDate']),
    classes: 'q-table--col-auto-width',
  },
  {
    name: 'createDate',
    label: 'Create Date',
    align: 'center',
    field: 'createDate',
    format: (val) => f.date(val as Todo['createDate']),
    classes: 'q-table--col-auto-width',
  },
  {
    name: 'name',
    label: 'Name',
    align: 'left',
    field: 'name',
    classes: 'text-wrap',
  },
  {
    name: 'owner',
    label: 'Owner',
    align: 'center',
    field: 'owner',
  },
  {
    name: 'assignedTo',
    label: 'Assigned to',
    align: 'left',
    field: (row) => mc.allAssignedTo(row.tasks),
    classes: 'text-wrap',
  },
  {
    name: 'new',
    label: 'New',
    align: 'center',
    field: (row) => mc.totalNew(row.tasks),
    classes: 'text-cyan',
  },
  {
    name: 'implemented',
    label: 'Implemented',
    align: 'center',
    field: (row) => mc.totalImplemented(row.tasks),
    classes: 'text-primary',
  },
  {
    name: 'tested',
    label: 'Tested',
    align: 'center',
    field: (row) => mc.totalTested(row.tasks),
    classes: 'text-green',
  },
  {
    name: 'closed',
    label: 'Closed',
    align: 'center',
    field: (row) => mc.totalClosed(row.tasks),
    classes: 'text-grey',
  },
  {
    name: 'isArchived',
    label: 'Archived',
    align: 'center',
    field: 'isArchived',
  },
];

// usePageData
$p.modelFindKeyField.value = 'urlFriendlyName';

// useClientFilter
$p.clientFilterItems.value = (items) =>
  items.filter((item) => {
    if (
      clientFilterText.value &&
      !stringContains(item.name, clientFilterText.value) &&
      !stringContains(item.owner.fullName, clientFilterText.value)
    ) {
      return false;
    }

    return true;
  });

// useNavigateToViewPage
$p.viewUrl.value = '/todos/';

// useNavigateToNewPage
$p.newUrl.value = '/todos/new';
$p.newButton.value = hasRole('project-leader');

// Methods

function todoDisplayDates(todo: Todo) {
  return `${f.date(todo.createDate) as string} - ${f.date(todo.dueDate) as string}`;
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
                label="Name, Owner"
              />
            </template>
          </div>
        </div>
      </template>

      <template #body-cell-name="{ props }">
        <q-td :props="props">
          {{ props.value }}
          <sup v-if="cr(props.row).isPrivate">
            <q-icon color="negative" name="fas fa-lock" />
          </sup>
        </q-td>
      </template>
      <template #body-cell-owner="{ props }">
        <q-td :props="props">
          <ObjectLink
            color="primary"
            :label="props.value.fullName"
            :to="`/team/member/${props.value.id}`"
          />
        </q-td>
      </template>
      <template #body-cell-assignedTo="{ props }">
        <q-td :props="props">
          <TaskAssignedTo :members="props.value" />
        </q-td>
      </template>
      <template #body-cell-new="{ props }">
        <q-td :props="props">
          <template v-if="props.value > 0">
            <q-icon name="fal fa-bars-progress" />
            {{ props.value }}
          </template>
        </q-td>
      </template>
      <template #body-cell-implemented="{ props }">
        <q-td :props="props">
          <template v-if="props.value > 0">
            <q-icon name="fal fa-check-double" />
            {{ props.value }}
          </template>
        </q-td>
      </template>
      <template #body-cell-tested="{ props }">
        <q-td :props="props">
          <template v-if="props.value > 0">
            <q-icon name="fal fa-thumbs-up" />
            {{ props.value }}
          </template>
        </q-td>
      </template>
      <template #body-cell-closed="{ props }">
        <q-td :props="props">
          <template v-if="props.value > 0">
            <q-icon name="fal fa-circle-xmark" />
            {{ props.value }}
          </template>
        </q-td>
      </template>
      <template #body-cell-isArchived="{ props }">
        <q-td auto-width :props="props">
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
          body-class="q-col-gutter-xs row"
          clickable
          :external-link-url="link()"
          header-separator
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="todoDisplayDates(model)"
          :title="model.name"
          :title-end-icon="model.isPrivate ? 'fas fa-lock' : undefined"
          title-end-icon-color="negative"
          title-end-icon-superscript
          title-full-width
          @click="onItemClick($event, model, true)"
        >
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

          <template #body>
            <div class="col-12 row justify-between text-caption">
              <span>Owned by</span>
              <ObjectLink
                color="primary"
                icon="fal fa-user"
                :label="model.owner.fullName"
                size="sm"
                :to="`/team/member/${model.owner.id}`"
              />
            </div>

            <div class="col-12 row justify-between text-caption">
              <span>Assigned to</span>

              <span v-if="mc.allAssignedTo(model.tasks).length === 0"> None </span>
              <span v-else>
                <TaskAssignedTo icon :members="mc.allAssignedTo(model.tasks)" size="sm" />
              </span>
            </div>

            <div class="col-3 text-cyan text-caption">
              <span v-if="mc.totalNew(model.tasks) > 0">
                <q-icon name="fal fa-bars-progress" />
                {{ mc.totalNew(model.tasks) }}
                <TopTooltip>New</TopTooltip>
              </span>
            </div>
            <div class="col-3 text-primary text-caption">
              <span v-if="mc.totalImplemented(model.tasks) > 0">
                <q-icon name="fal fa-check-double" />
                {{ mc.totalImplemented(model.tasks) }}
                <TopTooltip>Implemented</TopTooltip>
              </span>
            </div>
            <div class="col-3 text-green text-caption">
              <span v-if="mc.totalTested(model.tasks) > 0">
                <q-icon name="fal fa-thumbs-up" />
                {{ mc.totalTested(model.tasks) }}
                <TopTooltip>Tested</TopTooltip>
              </span>
            </div>
            <div class="col-3 text-grey text-caption">
              <span v-if="mc.totalClosed(model.tasks) > 0">
                <q-icon name="fal fa-circle-xmark" />
                {{ mc.totalClosed(model.tasks) }}
                <TopTooltip>Closed</TopTooltip>
              </span>
            </div>
          </template>
        </ExpandableCard>
      </template>
    </ListPage>
  </QPagePadding>
</template>
