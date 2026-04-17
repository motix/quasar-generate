import type { Ref } from 'vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { where } from 'firebase/firestore';

import { sortBy } from 'lodash-es';

import type { Expense } from 'models/finance/index.js';

import { useInstantGeneralExpensesStore } from 'stores/finance/GeneralExpenses.js';

import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import useFormats from 'composables/useFormats.js';
import useNotifications from 'composables/useNotifications.js';

type Props = { expenseGroupId: string };

export default function useExpenseGroupExpensesList<TParent extends NonNullable<unknown>>(
  props: Readonly<Props>,
) {
  // Private

  const router = useRouter();

  async function loadExpenses() {
    try {
      await loadExpensesFromStore.value();

      expensesReady.value = true;
    } catch (error) {
      console.error(error);
      notifyLoadDataError();
      notifyErrorDebug(error);
      expensesReady.value = true;
    }
  }

  // Composables

  const f = useFormats();

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  const emc = useExpenseCalculator<Expense>();

  // Data

  const expensesReady = ref(false);
  const expenseRecords = ref(null) as Ref<
    | {
        expense: Expense;
        parent?: TParent;
      }[]
    | null
  >;

  // Method Refs

  const loadExpensesFromStore = ref<() => Promise<void>>(async () => {
    const expensesStore = useInstantGeneralExpensesStore();

    await expensesStore.loadAllDocs({
      queryConstraints: [where('group.id', '==', props.expenseGroupId)],
    });

    // orderBy('issueDate', 'desc'),
    // orderBy('createDate'),
    expenseRecords.value = sortBy(
      sortBy(
        // Casting is requried as DocumentStatus contains private fields
        // See https://github.com/vuejs/core/issues/2981
        (expensesStore.docs as Expense[]).map((expense) => ({
          expense,
        })),
        (record) => record.expense.createDate,
      ).reverse(),
      (record) => record.expense.issueDate,
    ).reverse();

    expensesStore.$dispose();
  });

  const buidHasParentExpenseLink = ref<((expense: Expense, parent: TParent) => string) | null>(
    null,
  );

  // Methods

  function onExpenseClick(expense: Expense, parent?: TParent) {
    setTimeout(() => {
      void router.push(
        parent
          ? buidHasParentExpenseLink.value?.(expense, parent) ||
              (function () {
                throw new Error('[finance-expense-groups] buidHasParentExpenseLink not set');
              })()
          : `/general-expenses/${expense.code.replaceAll('.', '_')}`,
      );
    }, 300);
  }

  // Lifecycle Hooks

  onMounted(() => loadExpenses());

  // Watch

  watch(
    computed(() => props.expenseGroupId),
    async () => {
      expensesReady.value = false;
      expenseRecords.value = null;

      await loadExpenses();
    },
  );

  return {
    f,
    emc,
    expensesReady,
    expenseRecords,
    loadExpensesFromStore,
    buidHasParentExpenseLink,
    onExpenseClick,
  };
}
