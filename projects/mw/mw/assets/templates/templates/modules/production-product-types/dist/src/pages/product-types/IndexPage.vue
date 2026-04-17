<script setup lang="ts">
import { where } from 'firebase/firestore';

import type { ProductType } from 'models/production/index.js';

import {
  productTypesStoreDefaultSort,
  useProductTypesStore,
} from 'stores/production/ProductTypes.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

// Constants

const SCOPE_NAME = 'product-types-list-page';

// Options

defineOptions({ name: 'AliveIndex' });

// Composables

const { hasRole } = useFirebaseAuth();

const $p = useListPage<ProductType<never>, ProductType<never>>(SCOPE_NAME, true);
const {
  // Auto sort
  listItemCardWidth,
  onItemClick,
} = $p;

const { store, onLoadNextPage } = useListPageStore<ProductType<never>>(
  useProductTypesStore(),
  $p.loadPage,
  $p.appendItems,
  $p.updateItems,
);

const { filterLabel, filterItems, filterOptions } = useListPageFilterWithOptionsAndStore<
  ProductType<never>,
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
    label: 'Active Product Types',
    queryConstraints: [where('isActive', '==', true), ...productTypesStoreDefaultSort],
  },
  {
    type: 'all',
    label: 'All Product Types',
    queryConstraints: [...productTypesStoreDefaultSort],
  },
);

// Private Executions

// usePageFeatures
$p.newButton.value = hasRole('maintenance');

// useTableView
$p.columns.value = [
  {
    name: 'position',
    label: 'Position',
    align: 'right',
    field: 'position',
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

// useNavigateToViewPage
$p.viewUrl.value = '/product-types/';

// useNavigateToNewPage
$p.newUrl.value = '/product-types/new';
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
          :caption="'#' + model.position"
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
