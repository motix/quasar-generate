import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import type { QSelectProps } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { where } from 'firebase/firestore';

import type { Customer, CustomerLite } from 'models/production/index.js';

import { customersStoreDefaultSort, useCustomersStore } from 'stores/production/Customers.js';

export default function useCustomerOptions(...queryConstraints: QueryConstraint[]) {
  // Composables

  const customersStore = useCustomersStore();

  // Data

  const customerOptions: Ref<CustomerLite[]> = ref([]);

  const customersEditorDependenciesStore = {
    store: customersStore,
    payload: {
      queryConstraints: [
        where('isActive', '==', true),
        ...queryConstraints,
        ...customersStoreDefaultSort,
      ],
    },
  };

  // Computed

  const customers = computed<Customer[]>(() => {
    return customersStore.docs;
  });

  // Methods

  function filterCustomerOptions(
    ...[inputValue, doneFn]: Parameters<Required<QSelectProps>['onFilter']>
  ) {
    function buildOptions(filteredCustomers: Customer[]) {
      return filteredCustomers.map<CustomerLite>((value) => ({
        id: value.id,
        code: value.code,
        name: value.name,
      }));
    }

    if (inputValue === '') {
      doneFn(() => {
        customerOptions.value = buildOptions(customers.value);
      });

      return;
    }

    doneFn(() => {
      const search = inputValue.toLowerCase();
      customerOptions.value = buildOptions(
        customers.value.filter((value) => value.name.toLowerCase().includes(search)),
      );
    });
  }

  return {
    customersStore,
    customerOptions,
    customersEditorDependenciesStore,
    customers,
    filterCustomerOptions,
  };
}
