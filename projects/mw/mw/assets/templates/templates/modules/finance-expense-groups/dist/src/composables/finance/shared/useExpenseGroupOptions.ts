import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import type { QSelectProps } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { where } from 'firebase/firestore';

import type { ExpenseGroup, ExpenseGroupLite } from 'models/finance/index.js';

import {
  expenseGroupsStoreDefaultSort,
  useExpenseGroupsStore,
} from 'stores/finance/ExpenseGroups.js';

export default function useExpenseGroupOptions(...queryConstraints: QueryConstraint[]) {
  // Composables

  const expenseGroupsStore = useExpenseGroupsStore();

  // Data

  const expenseGroupOptions: Ref<ExpenseGroupLite[]> = ref([]);

  const expenseGroupsEditorDependenciesStore = {
    store: expenseGroupsStore,
    payload: {
      queryConstraints: [
        where('isActive', '==', true),
        ...queryConstraints,
        ...expenseGroupsStoreDefaultSort,
      ],
    },
  };

  // Computed

  const expenseGroups = computed<ExpenseGroup[]>(() => {
    return expenseGroupsStore.docs;
  });

  // Methods

  function filterExpenseGroupOptions(
    ...[inputValue, doneFn]: Parameters<Required<QSelectProps>['onFilter']>
  ) {
    function buildOptions(filteredExpenseGroups: ExpenseGroup[]) {
      return filteredExpenseGroups.map<ExpenseGroupLite>((value) => ({
        id: value.id,
        name: value.name,
      }));
    }

    if (inputValue === '') {
      doneFn(() => {
        expenseGroupOptions.value = buildOptions(expenseGroups.value);
      });

      return;
    }

    doneFn(() => {
      const search = inputValue.toLowerCase();
      expenseGroupOptions.value = buildOptions(
        expenseGroups.value.filter((value) => value.name.toLowerCase().includes(search)),
      );
    });
  }

  return {
    expenseGroupsStore,
    expenseGroupOptions,
    expenseGroupsEditorDependenciesStore,
    expenseGroups,
    filterExpenseGroupOptions,
  };
}
