import { computed } from 'vue';

import type { Transaction } from 'models/finance/index.js';

import useProjectViewPage from 'composables/finance/project/useProjectViewPage.js';
import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';

type TViewPage = ReturnType<typeof useProjectViewPage>;

function useTransactionsExtra($p: TViewPage) {
  // Composables

  const tmc = useTransactionCalculator<Transaction>();

  // Computed

  const viewTransactionUrl = computed(() => `/project-transactions/${$p.m.value.urlFriendlyName}`);

  return {
    tmc,
    viewTransactionUrl,
  };
}

export function extendProjectViewPage_ProjectInvoicesExpensesSupport($p: TViewPage) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useProjectViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useTransactionsExtra>;

  Object.assign(extension, useTransactionsExtra($p));
  Object.assign($p, extension);

  return extension;
}

export default function useProjectViewPage_ProjectInvoicesExpensesSupport(scopeName: string) {
  const $p = useProjectViewPage(scopeName);

  return $p as typeof $p & ReturnType<typeof extendProjectViewPage_ProjectInvoicesExpensesSupport>;
}
