<script setup lang="ts">
import { where } from 'firebase/firestore';

import type { Supplier } from 'models/finance/index.js';

import { suppliersStoreDefaultSort, useSuppliersStore } from 'stores/finance/Suppliers.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';

// Constants

const SCOPE_NAME = 'suppliers-list-page';

// Options

defineOptions({ name: 'AliveIndex' });

// Composables

const $p = useListPage<Supplier, Supplier>(SCOPE_NAME, true);
const {
  // Auto sort
  listItemCardWidth,
  onItemClick,
} = $p;

const { store, onLoadNextPage } = useListPageStore<Supplier>(
  useSuppliersStore(),
  $p.loadPage,
  $p.appendItems,
  $p.updateItems,
);

const { filterLabel, filterItems, filterOptions } = useListPageFilterWithOptionsAndStore<
  Supplier,
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
    label: 'Active Suppliers',
    queryConstraints: [where('isActive', '==', true), ...suppliersStoreDefaultSort],
  },
  {
    type: 'all',
    label: 'All Suppliers',
    queryConstraints: [...suppliersStoreDefaultSort],
  },
);

// Private Executions

// useTableView
$p.columns.value = [
  {
    name: 'code',
    label: 'Code',
    align: 'left',
    field: 'code',
  },
  {
    name: 'name',
    label: 'Name',
    align: 'left',
    field: 'name',
  },
  {
    name: 'isActive',
    label: 'Active',
    align: 'center',
    field: 'isActive',
  },
];

// usePageData
$p.modelFindKeyField.value = 'code';

// useNavigateToViewPage
$p.viewUrl.value = '/suppliers/';

// useNavigateToNewPage
$p.newUrl.value = '/suppliers/new';
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
          :caption="model.code"
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
