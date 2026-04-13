import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import type { QSelectProps } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { where } from 'firebase/firestore';

import type { Supplier, SupplierLite } from 'models/finance/index.js';

import { suppliersStoreDefaultSort, useSuppliersStore } from 'stores/finance/Suppliers.js';

export default function useSupplierOptions(...queryConstraints: QueryConstraint[]) {
  // Composables

  const suppliersStore = useSuppliersStore();

  // Data

  const supplierOptions: Ref<SupplierLite[]> = ref([]);

  const suppliersEditorDependenciesStore = {
    store: suppliersStore,
    payload: {
      queryConstraints: [
        where('isActive', '==', true),
        ...queryConstraints,
        ...suppliersStoreDefaultSort,
      ],
    },
  };

  // Computed

  const suppliers = computed<Supplier[]>(() => {
    return suppliersStore.docs;
  });

  // Methods

  function filterSupplierOptions(
    ...[inputValue, doneFn]: Parameters<Required<QSelectProps>['onFilter']>
  ) {
    function buildOptions(filteredSuppliers: Supplier[]) {
      return filteredSuppliers.map<SupplierLite>((value) => ({
        id: value.id,
        code: value.code,
        name: value.name,
      }));
    }

    if (inputValue === '') {
      doneFn(() => {
        supplierOptions.value = buildOptions(suppliers.value);
      });

      return;
    }

    doneFn(() => {
      const search = inputValue.toLowerCase();
      supplierOptions.value = buildOptions(
        suppliers.value.filter((value) => value.name.toLowerCase().includes(search)),
      );
    });
  }

  return {
    suppliersStore,
    supplierOptions,
    suppliersEditorDependenciesStore,
    suppliers,
    filterSupplierOptions,
  };
}
