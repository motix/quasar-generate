<script setup lang="ts">
import { computed, ref } from 'vue';

import { Timestamp, where } from 'firebase/firestore';

import { sortBy, uniqBy } from 'lodash-es';

import type { ProjectStatusName } from 'utils/finance/Project/ProjectStatus.js';
import { projectStatusNames } from 'utils/finance/Project/ProjectStatus.js';
import stringContains from 'utils/stringContains.js';

import type { Project } from 'models/finance/index.js';

import { projectsStoreDefaultSort, useProjectsStore } from 'stores/finance/Projects.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import type { FilterOptions } from 'composables/crud-pages/useListPageFilterWithOptions.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

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

const $p = useListPage<Project, Project>(SCOPE_NAME, true);
const {
  // Auto sort
  cr,
  clientFilterText,
  itemLink,
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

const clientFilterStatus = ref<ProjectStatusName | null>(null);

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
    style: 'max-width: 300px',
    classes: 'text-wrap',
  },
  {
    name: 'owner',
    label: 'Owner',
    align: 'center',
    field: 'owner',
  },
  {
    name: 'status',
    label: 'Status',
    align: 'center',
    field: 'statusHelper',
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
      !stringContains(item.owner, clientFilterText.value)
    ) {
      return false;
    }

    if (clientFilterStatus.value && item.statusHelper.statusName !== clientFilterStatus.value) {
      return false;
    }

    return true;
  });

// useNavigateToViewPage
$p.viewUrl.value = '/projects/';

// useNavigateToNewPage
$p.newButton.value = false;
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

              <q-select
                v-model="clientFilterStatus"
                class="col-12 col-md-2"
                dense
                emit-value
                hide-bottom-space
                label="Status"
                map-options
                :options="projectStatusOptions"
              />
            </template>
          </div>
        </div>
      </template>

      <template #body-cell-name="{ props }">
        <q-td :props="props">
          <ObjectLink color="primary" :label="props.value" :to="itemLink(cr(props.row))">
            <template #icon>
              <StatusIcon
                class="q-mr-sm"
                icon="fal fa-briefcase"
                :status="cr(props.row).statusHelper"
              />
            </template>
          </ObjectLink>
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
              color="primary"
              :label="cr(props.row).customer.name"
              :to="`/customers/${cr(props.row).customer.code}`"
            />
          </div>
          <div class="text-caption">
            {{ cr(props.row).customerContact }}
          </div>
        </q-td>
      </template>
      <template #body-cell-status="{ props }">
        <q-td auto-width :props="props">
          <StatusBadge :status="props.value" />
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
          :subtitle="f.date(model.finishDate) || undefined"
          subtitle-tooltip="Finish Date"
          :title="model.name"
          title-full-width
          @click="onItemClick($event, model, true)"
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

          <template #body>
            <div class="col-6">
              <ObjectLink
                color="primary"
                icon="fal fa-user-crown"
                :label="model.customer.name"
                size="sm"
                :to="`/customers/${model.customer.code}`"
              />
            </div>

            <div class="col-6 text-right">
              <ObjectLink icon="fal fa-user" :label="model.owner" :ripple="false" size="sm" />
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
