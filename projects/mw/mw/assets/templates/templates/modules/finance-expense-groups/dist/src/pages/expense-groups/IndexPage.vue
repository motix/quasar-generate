<script setup lang="ts">
import { where } from 'firebase/firestore';

import type { ExpenseGroup } from 'models/finance/index.js';

import {
  expenseGroupsStoreDefaultSort,
  useExpenseGroupsStore,
} from 'stores/finance/ExpenseGroups.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';

// Constants

const SCOPE_NAME = 'expense-groups-list-page';

// Options

defineOptions({ name: 'AliveIndex' });

// Composables

const $p = useListPage<ExpenseGroup, ExpenseGroup>(SCOPE_NAME, true);
const {
  // Auto sort
  listItemCardWidth,
  onItemClick,
} = $p;

const { store, onLoadNextPage } = useListPageStore<ExpenseGroup>(
  useExpenseGroupsStore(),
  $p.loadPage,
  $p.appendItems,
  $p.updateItems,
);

const { filterLabel, filterItems, filterOptions } = useListPageFilterWithOptionsAndStore<
  ExpenseGroup,
  'active' | 'all'
>(
  $p.ready,
  $p.queryConstraints,
  'active',
  store,
  $p.loadFirstPage,
  $p.resetItems,
  {
    type: 'active',
    label: 'Active Expense Groups',
    queryConstraints: [where('isActive', '==', true), ...expenseGroupsStoreDefaultSort],
  },
  {
    type: 'all',
    label: 'All Expense Groups',
    queryConstraints: [...expenseGroupsStoreDefaultSort],
  },
);

// Private Executions

// useTableView
$p.columns.value = [
  {
    name: 'name',
    label: 'Name',
    align: 'left',
    field: 'name',
  },
  {
    name: 'description',
    label: 'Description',
    align: 'left',
    field: 'description',
  },
  {
    name: 'isActive',
    label: 'Active',
    align: 'center',
    field: 'isActive',
  },
];

// useNavigateToViewPage
$p.viewUrl.value = '/expense-groups/';

// useNavigateToNewPage
$p.newUrl.value = '/expense-groups/new';
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

      <template #body-cell-isActive="{ props }">
        <q-td auto-width :props="props">
          <q-toggle
            v-model="props.value"
            checked-icon="fal fa-power-off"
            color="primary"
            disable
            unchecked-icon="clear"
          />
        </q-td>
      </template>

      <template #item-card="{ model, link }">
        <ExpandableCard
          :caption="model.description"
          clickable
          :external-link-url="link()"
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :title="model.name"
          @click="onItemClick($event, model, true)"
        >
          <template #side>
            <q-toggle
              v-model="model.isActive"
              checked-icon="fal fa-power-off"
              class="right-toggle"
              color="primary"
              disable
              unchecked-icon="clear"
            >
              <TopTooltip>Active</TopTooltip>
            </q-toggle>
          </template>
        </ExpandableCard>
      </template>
    </ListPage>
  </QPagePadding>
</template>
