import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import type { QSelectProps } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { where } from 'firebase/firestore';

import type { FinanceAccount, FinanceAccountLite } from 'models/finance/index.js';

import {
  financeAccountsStoreDefaultSort,
  useFinanceAccountsStore,
} from 'stores/finance/FinanceAccounts.js';

export default function useFinanceAccountOptions(...queryConstraints: QueryConstraint[]) {
  // Composables

  const financeAccountsStore = useFinanceAccountsStore();

  // Data

  const financeAccountOptions: Ref<FinanceAccountLite[]> = ref([]);

  const financeAccountsEditorDependenciesStore = {
    store: financeAccountsStore,
    payload: {
      queryConstraints: [
        where('isActive', '==', true),
        ...queryConstraints,
        ...financeAccountsStoreDefaultSort,
      ],
    },
  };

  // Computed

  const financeAccounts = computed<FinanceAccount[]>(() => {
    return financeAccountsStore.docs;
  });

  // Methods

  function filterFinanceAccountOptions(
    ...[inputValue, doneFn]: Parameters<Required<QSelectProps>['onFilter']>
  ) {
    function buildOptions(filteredFinanceAccounts: FinanceAccount[]) {
      return filteredFinanceAccounts.map<FinanceAccountLite>((value) => ({
        id: value.id,
        name: value.name,
      }));
    }

    if (inputValue === '') {
      doneFn(() => {
        financeAccountOptions.value = buildOptions(financeAccounts.value);
      });

      return;
    }

    doneFn(() => {
      const search = inputValue.toLowerCase();
      financeAccountOptions.value = buildOptions(
        financeAccounts.value.filter((value) => value.name.toLowerCase().includes(search)),
      );
    });
  }

  return {
    financeAccountsStore,
    financeAccountOptions,
    financeAccountsEditorDependenciesStore,
    financeAccounts,
    filterFinanceAccountOptions,
  };
}
