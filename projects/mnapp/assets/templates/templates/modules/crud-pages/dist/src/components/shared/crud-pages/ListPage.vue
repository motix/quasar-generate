<script lang="ts">
import type { VNode } from 'vue';
import { computed, nextTick, ref, useSlots, useTemplateRef, watchEffect } from 'vue';

import type { QTableSlots } from 'quasar';
import { Dark, QInfiniteScroll } from 'quasar';

import type { ListPage } from 'composables/crud-pages/useListPage/index.js';
import useListPage from 'composables/crud-pages/useListPage/index.js';
import useMultiViews from 'composables/useMultiViews.js';

import FloatToolbar from 'components/shared/FloatToolbar.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';
import SwitchViewButton from 'components/shared/SwitchViewButton.vue';

type HeaderCellProps = Parameters<QTableSlots['header-cell-']>[0];
type BodyCellProps = Parameters<QTableSlots['body-cell-']>[0];

export interface ListPageSlots<T extends NonNullable<unknown>> {
  [key: `header-cell-${string}`]: (props: { props: HeaderCellProps }) => VNode[];
  [key: `body-cell-${string}`]: (props: { props: BodyCellProps }) => VNode[];
  table: () => VNode[];
  cards: () => VNode[];
  top?: () => VNode[];
  'toolbar-extra': () => VNode[];
  'item-card': (props: { model: T; link: () => string }) => VNode[];
}

function useTableView<T extends NonNullable<unknown>, TRow extends NonNullable<unknown>>(
  scopeName: string,
) {
  // Slots

  const slots = useSlots() as unknown as Readonly<ListPageSlots<T>> & ListPageSlots<T>;

  // Composables

  const {
    // useTableView
    wrapCells,
    columns,
    pagination,
    mainTableStickyHeadersRef,
    rows,
  } = useListPage<T, TRow>(scopeName);

  // Computed

  const headerSlotNames = computed(() => {
    const names = [];

    for (const name in slots) {
      name.startsWith('header-cell-') && names.push(name);
    }

    return names as `header-cell-${string}`[];
  });

  const bodySlotNames = computed(() => {
    const names = [];

    for (const name in slots) {
      name.startsWith('body-cell-') && names.push(name);
    }

    return names as `body-cell-${string}`[];
  });

  return {
    wrapCells,
    columns,
    pagination,
    mainTableStickyHeadersRef,
    rows,
    headerSlotNames,
    bodySlotNames,
  };
}

function useAutoLoadAllPages() {
  // Data

  const autoLoadAllPages = ref(false);
  const hideAutoLoadAllPagesButton = ref(false);
  const infiniteScrollRef = useTemplateRef<QInfiniteScroll>('infiniteScroll');

  // Methods

  function toggleAutoLoadAllPages() {
    autoLoadAllPages.value = !autoLoadAllPages.value;

    infiniteScrollRef.value?.trigger();
  }

  return {
    autoLoadAllPages,
    hideAutoLoadAllPagesButton,
    infiniteScrollRef,
    toggleAutoLoadAllPages,
  };
}

function usePageData<T extends NonNullable<unknown>, TRow extends NonNullable<unknown>>(
  scopeName: string,
  emitLoadNextPage: (e: 'loadNextPage', index: number, done: (stop: boolean) => void) => void,
  autoLoadAllPages: ReturnType<typeof useAutoLoadAllPages>['autoLoadAllPages'],
  infiniteScrollRef: ReturnType<typeof useAutoLoadAllPages>['infiniteScrollRef'],
) {
  // Composables

  const {
    // usePageData
    items,
    allItemsLoaded,
    itemCountLabel,
    // useClientFilter
    clientFilteredItems,
    clientFilteredItemCountLabel,
  } = useListPage<T, TRow>(scopeName);

  // Methods

  function onLoadNextPage(index: number, done: (stop: boolean) => void) {
    emitLoadNextPage('loadNextPage', index, (stop) => {
      done(stop);
      allItemsLoaded.value = stop;

      if (stop) {
        autoLoadAllPages.value = false;
      } else if (autoLoadAllPages.value) {
        infiniteScrollRef.value?.trigger();
      }
    });
  }

  return {
    items,
    allItemsLoaded,
    itemCountLabel,
    clientFilteredItems,
    clientFilteredItemCountLabel,
    onLoadNextPage,
  };
}

function useNavigateToViewPage<T extends NonNullable<unknown>, TRow extends NonNullable<unknown>>(
  scopeName: string,
) {
  // Composables

  const {
    // useTableView
    onRowClick,
    // useNavigateToViewPage
    viewUrl,
    itemLink,
    onItemClick,
  } = useListPage<T, TRow>(scopeName);

  // Computed

  const hasViewPage = computed(() => viewUrl.value !== null);

  // Methods

  function handleRowClick(evt: Event, row: TRow) {
    if (onRowClick.value) {
      onRowClick.value(evt, row);
    } else if ((evt.target as Element).localName !== 'a') {
      let parent = (evt.target as Element).parentNode;

      while (parent !== null && parent.nodeName !== 'A') {
        parent = parent.parentNode;
      }

      if (parent === null) {
        // Normally T and TRow are the same, if implemented differently,
        // override onRowClick behaviour by setting onRowClick.value
        onItemClick(evt as MouseEvent, row as unknown as T, false);
      }
    }
  }

  return {
    itemLink,
    hasViewPage,
    onRowClick: handleRowClick,
  };
}

function usePageMultiViews<T extends NonNullable<unknown>, TRow extends NonNullable<unknown>>(
  scopeName: string,
) {
  // Slots

  const slots = useSlots() as unknown as Readonly<ListPageSlots<T>> & ListPageSlots<T>;

  // Composables

  const { isTableView, isCardsView } = useMultiViews();

  const {
    // useTableView
    columns,
  } = useListPage<T, TRow>(scopeName);

  // Computed

  const hasTableView = computed(() => !!columns.value || !!slots['table']);
  const hasCardsView = computed(() => !!slots['item-card'] || !!slots['cards']);
  const hasMultiViews = computed(() => hasTableView.value && hasCardsView.value);

  return {
    isTableView,
    isCardsView,
    hasTableView,
    hasCardsView,
    hasMultiViews,
  };
}

function useSmoothHideInfiniteScrollLoading<
  T extends NonNullable<unknown>,
  TRow extends NonNullable<unknown>,
>(scopeName: string) {
  // Composables

  const {
    // usePageData
    allItemsLoaded,
  } = useListPage<T, TRow>(scopeName);

  // Data

  const hideInfiniteScrollLoading = ref(false);

  // Watch

  watchEffect(() => {
    if (allItemsLoaded.value) {
      void nextTick(() => {
        hideInfiniteScrollLoading.value = true;
      });
    } else {
      hideInfiniteScrollLoading.value = false;
    }
  });

  return {
    hideInfiniteScrollLoading,
  };
}
</script>

<script setup lang="ts" generic="T extends NonNullable<unknown>, TRow extends NonNullable<unknown>">
// Props

const props = defineProps<{
  scopeName: string;
  // T and TRow will be inferred from this prop
  composition: ListPage<T, TRow>;
}>();

// Slots

const slots = defineSlots<ListPageSlots<T>>();

// Emit

const emit = defineEmits<{
  loadNextPage: [index: number, done: (stop: boolean) => void];
}>();

// Composables

const {
  // usePageStatus
  ready,
  // useNavigateToNewPage
  newUrl,
  newButton,
} = useListPage<T, TRow>(props.scopeName);

const {
  wrapCells,
  columns,
  pagination,
  mainTableStickyHeadersRef,
  rows,
  headerSlotNames,
  bodySlotNames,
} = useTableView<T, TRow>(props.scopeName);

const { autoLoadAllPages, hideAutoLoadAllPagesButton, infiniteScrollRef, toggleAutoLoadAllPages } =
  useAutoLoadAllPages();

const {
  items,
  allItemsLoaded,
  itemCountLabel,
  clientFilteredItems,
  clientFilteredItemCountLabel,
  onLoadNextPage,
} = usePageData<T, TRow>(props.scopeName, emit, autoLoadAllPages, infiniteScrollRef);

const { itemLink, hasViewPage, onRowClick } = useNavigateToViewPage<T, TRow>(props.scopeName);

const { isTableView, isCardsView, hasTableView, hasCardsView, hasMultiViews } = usePageMultiViews<
  T,
  TRow
>(props.scopeName);

const { hideInfiniteScrollLoading } = useSmoothHideInfiniteScrollLoading<T, TRow>(props.scopeName);

// Computed

const switchViewButtonMargin = computed(
  () =>
    `${
      slots['toolbar-extra']
        ? (newButton.value ? 52 : 0) +
          (!hideAutoLoadAllPagesButton.value ? 52 : 0) +
          (newButton.value || !hideAutoLoadAllPagesButton.value ? 7 : 0)
        : newButton.value || !hideAutoLoadAllPagesButton.value
          ? 7
          : 0
    }px`,
);
</script>

<template>
  <div>
    <FadeTransition>
      <div v-if="!ready" key="loading" class="absolute-center">
        <!-- Loading -->
        <q-spinner-pie color="primary" size="6em" />
      </div>

      <div v-else-if="!items || !clientFilteredItems || items.length === 0" key="empty">
        <!-- Empty -->
        <div
          :class="{
            'text-center': hasCardsView && (isCardsView || !hasTableView),
          }"
        >
          <slot name="top"></slot>
        </div>
        <div class="q-my-md text-center">There is no data in this list.</div>
      </div>

      <div v-else key="ready">
        <!-- Ready -->
        <q-infinite-scroll ref="infiniteScroll" :offset="250" @load="onLoadNextPage">
          <FadeTransition>
            <slot v-if="hasTableView && (isTableView || !hasCardsView)" name="table">
              <div key="tableView">
                <StickyHeaders ref="mainTableStickyHeadersRef" target="#mainTable" />

                <q-table
                  id="mainTable"
                  v-model:pagination="pagination"
                  :columns="columns || undefined"
                  :rows="rows || []"
                  :wrap-cells="wrapCells"
                  v-on="hasViewPage ? { rowClick: onRowClick } : {}"
                >
                  <template v-if="$slots.top" #top>
                    <slot name="top"></slot>
                  </template>

                  <template v-for="slotName in headerSlotNames" #[slotName]="slotProps">
                    <slot :name="slotName" :props="slotProps"></slot>
                  </template>

                  <template v-for="slotName in bodySlotNames" #[slotName]="slotProps">
                    <slot :name="slotName" :props="slotProps"></slot>
                  </template>

                  <template #bottom>
                    <div class="text-center full-width">
                      {{ itemCountLabel }}
                      <template v-if="items.length > clientFilteredItems.length">
                        - {{ clientFilteredItemCountLabel }}
                      </template>
                    </div>
                  </template>
                </q-table>
              </div>
            </slot>

            <slot v-else-if="hasCardsView && (isCardsView || !hasTableView)" name="cards">
              <div key="cardsView">
                <div class="row items-start justify-evenly q-gutter-md">
                  <div class="col-12 q-mb-md text-center">
                    <slot name="top"></slot>
                  </div>

                  <div class="flex-break"></div>

                  <slot
                    v-for="item in clientFilteredItems"
                    :link="() => itemLink(item)"
                    :model="item"
                    name="item-card"
                  ></slot>
                </div>

                <div class="text-center q-mt-lg" :class="{ 'q-mb-md': allItemsLoaded }">
                  {{ itemCountLabel }}
                  <template v-if="items.length > clientFilteredItems.length">
                    - {{ clientFilteredItemCountLabel }}
                  </template>
                </div>
              </div>
            </slot>
          </FadeTransition>

          <!-- Smoothly hide loading template -->
          <q-slide-transition v-if="allItemsLoaded">
            <div v-show="!hideInfiniteScrollLoading" style="height: 72px"></div>
          </q-slide-transition>

          <template #loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>
      </div>
    </FadeTransition>

    <FloatToolbar v-if="$slots['toolbar-extra']" :fab-buttons-space-ignored="1">
      <template v-if="newButton || !hideAutoLoadAllPagesButton" #fixed-buttons>
        <q-btn
          v-if="newButton"
          key="add"
          :color="Dark.isActive ? 'grey-9' : 'grey-3'"
          icon="fal fa-plus"
          round
          text-color="primary"
          :to="newUrl"
        >
          <TopTooltip>Add</TopTooltip>
        </q-btn>

        <q-btn
          v-if="!hideAutoLoadAllPagesButton"
          key="autoLoadAllPages"
          :color="Dark.isActive ? 'grey-9' : 'grey-3'"
          :disable="!infiniteScrollRef || allItemsLoaded"
          :icon="autoLoadAllPages ? undefined : 'fas fa-ellipsis'"
          round
          text-color="primary"
          @click="toggleAutoLoadAllPages"
        >
          <q-spinner-dots v-if="autoLoadAllPages" color="primary" />
          <TopTooltip>Auto Load All Pages</TopTooltip>
        </q-btn>
      </template>

      <TransitionGroup
        key="extra"
        class="no-wrap row reverse"
        name="float-toolbar-transition"
        :style="{ 'margin-right': switchViewButtonMargin }"
        tag="div"
      >
        <SwitchViewButton v-if="hasMultiViews" key="switchView" />

        <slot name="toolbar-extra"></slot>
      </TransitionGroup>
    </FloatToolbar>

    <FloatToolbar v-else-if="newButton || hasMultiViews || !hideAutoLoadAllPagesButton">
      <template #fixed-buttons>
        <q-btn
          v-if="newButton"
          key="add"
          :color="Dark.isActive ? 'grey-9' : 'grey-3'"
          icon="fal fa-plus"
          round
          text-color="primary"
          :to="newUrl"
        >
          <TopTooltip>Add</TopTooltip>
        </q-btn>

        <q-btn
          v-if="!hideAutoLoadAllPagesButton"
          key="autoLoadAllPages"
          :color="Dark.isActive ? 'grey-9' : 'grey-3'"
          :disable="!infiniteScrollRef || allItemsLoaded"
          :icon="autoLoadAllPages ? undefined : 'fas fa-ellipsis'"
          round
          text-color="primary"
          @click="toggleAutoLoadAllPages"
        >
          <q-spinner-dots v-if="autoLoadAllPages" color="primary" />
          <TopTooltip>Auto Load All Pages</TopTooltip>
        </q-btn>

        <div
          v-if="hasMultiViews"
          key="extra"
          class="no-wrap row reverse"
          :style="{
            'margin-right': switchViewButtonMargin,
          }"
        >
          <SwitchViewButton />
        </div>
      </template>
    </FloatToolbar>
  </div>
</template>
