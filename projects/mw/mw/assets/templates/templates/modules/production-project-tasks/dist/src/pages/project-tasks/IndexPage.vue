<script setup lang="ts">
import { Timestamp, where } from 'firebase/firestore';

import stringContains from 'utils/stringContains.js';

import type { Project } from 'models/production/index.js';

import { projectsStoreDefaultSort, useProjectsStore } from 'stores/production/Projects.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import type { FilterOptions } from 'composables/crud-pages/useListPageFilterWithOptions.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import useProjectVisibleToUser from 'composables/production/project/useProjectVisibleToUser.js';
import useCurrentMember from 'composables/production/shared/useCurrentMember.js';
import useTaskCalculator from 'composables/tasks/task/useTaskCalculator.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import TaskAssignedTo from 'components/Task/TaskAssignedTo.vue';

// Constants

const SCOPE_NAME = 'project-tasks-list-page';

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

const f = useFormats();

const { isTableView, isCardsView } = useMultiViews();

const { authenticatedMember } = useCurrentMember();
const { projectVisibleToUser } = useProjectVisibleToUser(authenticatedMember);

const mc = useTaskCalculator();

const $p = useListPage<Project, Project>(SCOPE_NAME, true);
const {
  // Auto sort
  cr,
  clientFilterText,
  items,
  listItemCardWidth,
  onItemClick,
} = $p;

const { store, onLoadNextPage } = useListPageStore<Project>(
  useProjectsStore(),
  $p.loadPage,
  // appendItems
  (newItems: Project[]) => {
    $p.appendItems(newItems.filter((value) => projectVisibleToUser(value)));
  },
  // updateItems
  (recentlyAddedDocs: Project[], recentlyUpdatedDocs: Project[], recentlyDeletedDocs: string[]) => {
    $p.updateItems(
      recentlyAddedDocs.filter((value) => projectVisibleToUser(value)),
      recentlyUpdatedDocs,
      [
        ...recentlyDeletedDocs,
        ...recentlyUpdatedDocs
          .filter((value) => !projectVisibleToUser(value))
          .map((value) => value.id),
      ],
    );
  },
);

const { filterLabel, filterItems, filterOptions } = useListPageFilterWithOptionsAndStore<
  Project,
  'current' | number | 'archived' | 'all'
>(
  $p.ready,
  $p.queryConstraints,
  'current',
  store,
  $p.loadFirstPage,
  // resetItems
  (newItems: Project[]) => {
    $p.resetItems(newItems.filter((value) => projectVisibleToUser(value)));
  },
  ...options,
);

// Private Executions

// useTableView
$p.columns.value = [
  {
    name: 'finishDate',
    label: 'Finish Date',
    align: 'center',
    field: 'finishDate',
    format: (val) => f.date(val as Project['finishDate']),
    classes: 'q-table--col-auto-width',
  },
  {
    name: 'startDate',
    label: 'Start Date',
    align: 'center',
    field: 'startDate',
    format: (val) => f.date(val as Project['startDate']),
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
      !stringContains(item.customer.name, clientFilterText.value) &&
      !stringContains(item.customerContact, clientFilterText.value) &&
      !stringContains(item.owner.fullName, clientFilterText.value)
    ) {
      return false;
    }

    return true;
  });

// useNavigateToViewPage
$p.viewUrl.value = '/project-tasks/';

// useNavigateToNewPage
$p.newButton.value = false;

// Methods

function projectDisplayDates(project: Project) {
  return `${f.date(project.startDate) as string} - ${f.date(project.finishDate) as string}`;
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
                label="Name, Customer, Owner"
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
          :subtitle="projectDisplayDates(model)"
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

          <template
            v-if="
              mc.allAssignedTo(model.tasks).length > 0 ||
              mc.totalNew(model.tasks) > 0 ||
              mc.totalImplemented(model.tasks) > 0 ||
              mc.totalTested(model.tasks) > 0 ||
              mc.totalClosed(model.tasks) > 0
            "
            #body
          >
            <div class="col-12 text-caption">
              <TaskAssignedTo icon :members="mc.allAssignedTo(model.tasks)" size="sm" />
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
