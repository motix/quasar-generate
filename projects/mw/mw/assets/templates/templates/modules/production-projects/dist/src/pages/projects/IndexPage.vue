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
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

// Constants

const SCOPE_NAME = 'projects-list-page';

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

const { hasRole } = useFirebaseAuth();

const { authenticatedMember } = useCurrentMember();
const { projectVisibleToUser } = useProjectVisibleToUser(authenticatedMember);

const $p = useListPage<Project, Project>(SCOPE_NAME, true);
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
    name: 'customerCustomerContact',
    label: 'Customer / Contact',
    align: 'center',
    field: (row) => row,
    classes: 'text-wrap',
  },
  {
    name: 'owner',
    label: 'Owner',
    align: 'center',
    field: 'owner',
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
$p.viewUrl.value = '/projects/';

// useNavigateToNewPage
$p.newUrl.value = '/projects/new';
$p.newButton.value = hasRole('project-leader');

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
      <template #header-cell-customerCustomerContact="{ props }">
        <q-th :props="props">
          Customer<br />
          <span class="text-caption">Contact</span>
        </q-th>
      </template>
      <template #body-cell-customerCustomerContact="{ props }">
        <q-td :props="props">
          <div>
            <ObjectLink
              v-if="hasRole('project-leader')"
              color="primary"
              :label="cr(props.row).customer.name"
              :to="`/customers/${cr(props.row).customer.code}`"
              wrap-label
            />
            <template v-else>
              {{ props.value.name }}
            </template>
          </div>
          <div class="text-caption">
            {{ cr(props.row).customerContact }}
          </div>
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

          <template #body>
            <div class="col-6">
              <ObjectLink
                :color="hasRole('project-leader') ? 'primary' : undefined"
                icon="fal fa-user-crown"
                :label="model.customer.name"
                :ripple="hasRole('project-leader')"
                size="sm"
                :to="hasRole('project-leader') ? `/customers/${model.customer.code}` : undefined"
              />
            </div>

            <div class="col-6 text-right">
              <ObjectLink
                color="primary"
                icon="fal fa-user"
                :label="model.owner.fullName"
                size="sm"
                :to="`/team/member/${model.owner.id}`"
              />
            </div>

            <div class="col-12 text-caption">
              {{ model.customerContact }}
            </div>
          </template>
        </ExpandableCard>
      </template>
    </ListPage>
  </QPagePadding>
</template>
