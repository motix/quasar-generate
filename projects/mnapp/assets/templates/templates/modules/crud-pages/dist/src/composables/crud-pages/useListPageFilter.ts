import type { Ref } from 'vue';
import { computed, nextTick, onMounted, ref } from 'vue';

import type { ListPage } from './useListPage/index.js';

export default function useListPageFilter<FilterType>(
  ready: ListPage<never, never>['ready'],
  initialFilter: FilterType,
  generateFilterLabel: (filter: FilterType) => string,
  loadFilteredItems: (filter: FilterType) => Promise<void>,
) {
  // Data

  const currentFilter = ref<FilterType>(initialFilter) as Ref<FilterType>;

  // Computed

  const filterLabel = computed(() => generateFilterLabel(currentFilter.value));

  // Methods

  const filterItems = async (filter: FilterType) => {
    currentFilter.value = filter;
    ready.value = false;

    await loadFilteredItems(currentFilter.value);

    void nextTick(() => {
      ready.value = true;
    });
  };

  // Lifecycle Hooks

  onMounted(() => {
    void filterItems(currentFilter.value);
  });

  return {
    currentFilter,
    filterLabel,
    filterItems,
  };
}
