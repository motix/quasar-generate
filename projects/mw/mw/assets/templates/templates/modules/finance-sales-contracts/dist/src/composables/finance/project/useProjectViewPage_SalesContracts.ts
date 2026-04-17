import type { Ref } from 'vue';
import { computed, ref, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import { where } from 'firebase/firestore';

import type { SalesContract } from 'models/finance/index.js';

import {
  salesContractsStoreDefaultSort,
  useInstantSalesContractsStore,
} from 'stores/finance/SalesContracts.js';

import useProjectViewPage from 'composables/finance/project/useProjectViewPage.js';
import useSalesContractCalculator from 'composables/finance/sales-contract/useSalesContractCalculator.js';
import useNotifications from 'composables/useNotifications.js';

type TViewPage = ReturnType<typeof useProjectViewPage>;

function useSalesContractsExtra($p: TViewPage) {
  // Private

  const router = useRouter();

  async function loadContracts() {
    try {
      const salesContractsStore = useInstantSalesContractsStore();

      await salesContractsStore.loadAllDocs({
        queryConstraints: [
          where('customer.id', '==', $p.m.value.customer.id),
          ...salesContractsStoreDefaultSort,
        ],
      });

      // Casting is requried as DocumentStatus contains private fields
      // See https://github.com/vuejs/core/issues/2981
      contracts.value = salesContractsStore.docs as SalesContract[];

      salesContractsStore.$dispose();

      contracts.value = contracts.value.filter((contract) =>
        contract.projects.some((project) => project.id === $p.m.value.id),
      );

      contractsReady.value = true;
    } catch (error) {
      console.error(error);
      notifyLoadDataError();
      notifyErrorDebug(error);
      contractsReady.value = true;
    }
  }

  // Composables

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  const cmc = useSalesContractCalculator<SalesContract>();

  // Data

  const contractsReady = ref(false);
  const contracts = ref(null) as Ref<SalesContract[] | null>;

  // Methods

  function onContractClick(contract: SalesContract) {
    setTimeout(() => {
      void router.push(`/sales-contracts/${contract.urlFriendlyCode}`);
    }, 300);
  }

  // Watch

  watch(
    computed(() => $p.model.value?.customer.id),
    async () => {
      contractsReady.value = false;
      contracts.value = null;

      if (!$p.model.value) {
        return;
      }

      await loadContracts();
    },
  );

  watchEffect(() => {
    $p.collectionsHaveItems.value.contracts =
      !$p.editMode.value && (contracts.value?.length || 0) > 0;
  });

  return {
    cmc,
    contractsReady,
    contracts,
    onContractClick,
  };
}

export function extendProjectViewPage_SalesContracts($p: TViewPage) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useProjectViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useSalesContractsExtra>;

  Object.assign(extension, useSalesContractsExtra($p));
  Object.assign($p, extension);

  return extension;
}

export default function useProjectViewPage_SalesContracts(scopeName: string) {
  const $p = useProjectViewPage(scopeName);

  return $p as typeof $p & ReturnType<typeof extendProjectViewPage_SalesContracts>;
}
