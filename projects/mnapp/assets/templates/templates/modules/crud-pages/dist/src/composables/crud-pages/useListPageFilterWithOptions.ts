import { computed } from 'vue';

import type { QueryConstraint } from 'firebase/firestore';

import type { ListPage } from './useListPage/index.js';
import useListPageFilter from './useListPageFilter.js';

export type FilterOptions<FilterType> = {
  type: FilterType;
  label: string;
  selectedLabel?: string;
  queryConstraints: QueryConstraint[];
};

export default function useListPageFilterWithOptions<FilterType>(
  ready: ListPage<never, never>['ready'],
  queryConstraints: ListPage<never, never>['queryConstraints'],
  initialFilter: FilterType,
  loadItems: () => Promise<void>,
  ...options: FilterOptions<FilterType>[]
) {
  // Composables

  const listPageFilter = useListPageFilter<FilterType>(
    ready,
    initialFilter,
    (filter) => {
      const option = options.find((value) => value.type === filter);
      !option &&
        (() => {
          throw new Error(`[mnapp-crud-pages] Value '${String(filter)}' not reconized as filter`);
        })();

      return option.selectedLabel || option.label;
    },
    async (filter) => {
      const option = options.find((value) => value.type === filter);
      !option &&
        (() => {
          throw new Error(`[mnapp-crud-pages] Value '${String(filter)}' not reconized as filter`);
        })();
      queryConstraints.value = option.queryConstraints;

      return loadItems();
    },
  );

  // Computed

  const filterOptions = computed((): { type: FilterType; label: string; selected: boolean }[] => {
    return options.map((value) => ({
      type: value.type,
      label: value.label,
      selected: value.type === listPageFilter.currentFilter.value,
    }));
  });

  return {
    ...listPageFilter,
    filterOptions,
  };
}
