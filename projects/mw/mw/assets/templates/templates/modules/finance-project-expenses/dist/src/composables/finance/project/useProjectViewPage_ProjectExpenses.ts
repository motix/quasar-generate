import { computed, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import type { Expense } from 'models/finance/index.js';

import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import useProjectViewPage from 'composables/finance/project/useProjectViewPage.js';
import type { extendProjectViewPage_ProjectInvoicesExpensesSupport } from 'composables/finance/project/useProjectViewPage_ProjectInvoicesExpensesSupport.js';

type TViewPage = ReturnType<typeof useProjectViewPage> &
  ReturnType<typeof extendProjectViewPage_ProjectInvoicesExpensesSupport>;

function useExpensesExtra($p: TViewPage) {
  // Private

  const router = useRouter();

  // Composables

  const emc = useExpenseCalculator<Expense>();

  // Computed

  const showAddExpenseButton = computed(() => !$p.readonlyMode.value && !$p.editMode.value);

  // Methods

  function onExpenseClick(expense: Expense) {
    setTimeout(() => {
      void router.push(
        `/project-expenses/${$p.m.value.urlFriendlyName}/${expense.code.replaceAll('.', '_')}`,
      );
    }, 300);
  }

  // Watch

  watchEffect(() => {
    $p.collectionsHaveItems.value.expenses =
      !$p.editMode.value && ($p.model.value?.expenses.length || 0) > 0;
  });

  return {
    emc,
    showAddExpenseButton,
    onExpenseClick,
  };
}

export function extendProjectViewPage_ProjectExpenses($p: TViewPage) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useProjectViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useExpensesExtra>;

  Object.assign(extension, useExpensesExtra($p));
  Object.assign($p, extension);

  return extension;
}

export default function useProjectViewPage_ProjectExpenses(scopeName: string) {
  const $p = useProjectViewPage(scopeName);

  return $p as typeof $p &
    ReturnType<typeof extendProjectViewPage_ProjectExpenses> &
    ReturnType<typeof extendProjectViewPage_ProjectInvoicesExpensesSupport>;
}
