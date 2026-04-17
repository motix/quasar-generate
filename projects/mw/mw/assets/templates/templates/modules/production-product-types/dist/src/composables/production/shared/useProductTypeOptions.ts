import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import type { QSelectProps } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';

import type {
  ProductionSalaryDetail,
  ProductType,
  ProductTypeLite,
} from 'models/production/index.js';

import { useProductionSalaryDetailsStore } from 'stores/production/ProductionSalaryDetails.js';

export default function useProductTypeOptions(...queryConstraints: QueryConstraint[]) {
  // Composables

  const productionSalaryDetailsStore = useProductionSalaryDetailsStore();

  // Data

  const productTypeOptions: Ref<ProductTypeLite[]> = ref([]);

  const productTypesEditorDependenciesStore = {
    store: productionSalaryDetailsStore,
    payload: {
      queryConstraints: [...queryConstraints],
    },
  };

  // Computed

  const productTypes = computed<Required<ProductType<ProductionSalaryDetail>>[]>(() => {
    return productionSalaryDetailsStore.productTypes;
  });

  // Methods

  function filterProductTypeOptions(
    ...[inputValue, doneFn]: Parameters<Required<QSelectProps>['onFilter']>
  ) {
    function buildOptions(filteredProductTypes: Required<ProductType<ProductionSalaryDetail>>[]) {
      return filteredProductTypes.map<ProductTypeLite>((value) => ({
        id: value.id,
        name: value.name,
      }));
    }

    if (inputValue === '') {
      doneFn(() => {
        productTypeOptions.value = buildOptions(productTypes.value);
      });

      return;
    }

    doneFn(() => {
      const search = inputValue.toLowerCase();
      productTypeOptions.value = buildOptions(
        productTypes.value.filter((value) => value.name.toLowerCase().includes(search)),
      );
    });
  }

  return {
    productionSalaryDetailsStore,
    productTypeOptions,
    productTypesEditorDependenciesStore,
    productTypes,
    filterProductTypeOptions,
  };
}
