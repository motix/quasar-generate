import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import type { QSelectProps } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { where } from 'firebase/firestore';

import type { InvoiceGroup, InvoiceGroupLite } from 'models/finance/index.js';

import {
  invoiceGroupsStoreDefaultSort,
  useInvoiceGroupsStore,
} from 'stores/finance/InvoiceGroups.js';

export default function useInvoiceGroupOptions(...queryConstraints: QueryConstraint[]) {
  // Composables

  const invoiceGroupsStore = useInvoiceGroupsStore();

  // Data

  const invoiceGroupOptions: Ref<InvoiceGroupLite[]> = ref([]);

  const invoiceGroupsEditorDependenciesStore = {
    store: invoiceGroupsStore,
    payload: {
      queryConstraints: [
        where('isActive', '==', true),
        ...queryConstraints,
        ...invoiceGroupsStoreDefaultSort,
      ],
    },
  };

  // Computed

  const invoiceGroups = computed<InvoiceGroup[]>(() => {
    return invoiceGroupsStore.docs;
  });

  // Methods

  function filterInvoiceGroupOptions(
    ...[inputValue, doneFn]: Parameters<Required<QSelectProps>['onFilter']>
  ) {
    function buildOptions(filteredInvoiceGroups: InvoiceGroup[]) {
      return filteredInvoiceGroups.map<InvoiceGroupLite>((value) => ({
        id: value.id,
        name: value.name,
      }));
    }

    if (inputValue === '') {
      doneFn(() => {
        invoiceGroupOptions.value = buildOptions(invoiceGroups.value);
      });

      return;
    }

    doneFn(() => {
      const search = inputValue.toLowerCase();
      invoiceGroupOptions.value = buildOptions(
        invoiceGroups.value.filter((value) => value.name.toLowerCase().includes(search)),
      );
    });
  }

  return {
    invoiceGroupsStore,
    invoiceGroupOptions,
    invoiceGroupsEditorDependenciesStore,
    invoiceGroups,
    filterInvoiceGroupOptions,
  };
}
