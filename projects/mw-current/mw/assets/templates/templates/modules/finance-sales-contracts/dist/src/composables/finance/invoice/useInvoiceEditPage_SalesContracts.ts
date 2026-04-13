import type { Ref } from 'vue';
import { computed, ref, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import { where } from 'firebase/firestore';

import type { SalesContract } from 'models/finance/index.js';

import {
  salesContractsStoreDefaultSort,
  useInstantSalesContractsStore,
} from 'stores/finance/SalesContracts.js';

import { useCustomizedEditPage } from 'composables/crud-pages/useEditPage.js';
import type { useInvoiceNewPage } from 'composables/finance/invoice/useInvoiceEditPage.js';
import { useInvoiceViewPage } from 'composables/finance/invoice/useInvoiceEditPage.js';
import useSalesContractCalculator from 'composables/finance/sales-contract/useSalesContractCalculator.js';
import useNotifications from 'composables/useNotifications.js';

type TViewPage<HasParent extends boolean> = ReturnType<
  typeof useInvoiceViewPage<
    HasParent,
    HasParent extends false ? never : NonNullable<unknown>,
    HasParent extends false ? never : NonNullable<unknown>
  >
>;

function useViewPageSalesContractsExtra($p: TViewPage<false>) {
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
        contract.generalInvoices.some((generalInvoice) => generalInvoice.id === $p.m.value.id),
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

export function extendInvoiceViewPage_SalesContracts<HasParent extends boolean>(
  $p: TViewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useInvoiceViewPage has done initialization');
    })();

  const extension = {} as HasParent extends true
    ? Record<keyof ReturnType<typeof useViewPageSalesContractsExtra>, undefined>
    : ReturnType<typeof useViewPageSalesContractsExtra>;

  !$p.hasParent($p) &&
    Object.assign(extension, useViewPageSalesContractsExtra($p as TViewPage<false>));
  Object.assign($p, extension);

  return extension;
}

export function useInvoiceViewPage_SalesContracts(scopeName: string) {
  const $p = useInvoiceViewPage<false, never, never>(scopeName);

  return $p as typeof $p & ReturnType<typeof extendInvoiceViewPage_SalesContracts<false>>;
}

export default function useInvoiceEditPage_SalesContracts(scopeName: string) {
  return useCustomizedEditPage<
    ReturnType<typeof useInvoiceNewPage<false, never>>,
    ReturnType<typeof useInvoiceViewPage_SalesContracts>
  >(scopeName);
}
