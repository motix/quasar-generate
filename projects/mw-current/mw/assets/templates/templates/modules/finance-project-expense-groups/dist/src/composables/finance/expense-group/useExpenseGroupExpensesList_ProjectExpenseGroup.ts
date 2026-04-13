import { where } from 'firebase/firestore';

import { sortBy } from 'lodash-es';

import type { Expense, Project } from 'models/finance/index.js';

import { useInstantProjectsStore } from 'stores/finance/Projects';

import useExpenseGroupExpensesList from 'composables/finance/expense-group/useExpenseGroupExpensesList.js';

type Props = { expenseGroupId: string };

export default function useExpenseGroupExpensesList_ProjectExpenseGroup(props: Readonly<Props>) {
  // Composables

  const $p = useExpenseGroupExpensesList<Project>(props);
  const {
    // Auto sort
    buidHasParentExpenseLink,
    expenseRecords,
    loadExpensesFromStore,
  } = $p;

  // Private Executions

  const originalLoadExpensesFromStore = loadExpensesFromStore.value;
  loadExpensesFromStore.value = async () => {
    await originalLoadExpensesFromStore();

    const projectsStore = useInstantProjectsStore();

    await projectsStore.loadAllDocs({
      queryConstraints: [where('expenseGroupIds', 'array-contains', props.expenseGroupId)],
    });

    // orderBy('issueDate', 'desc'),
    // orderBy('createDate'),
    expenseRecords.value = sortBy(
      sortBy(
        [
          ...(expenseRecords.value || []),

          // Casting is requried as DocumentStatus contains private fields
          // See https://github.com/vuejs/core/issues/2981
          ...(projectsStore.docs as Project[]).flatMap((project) =>
            project.expenses
              .filter((expense) => expense.group?.id === props.expenseGroupId)
              .map((expense) => ({
                expense,
                parent: project,
              })),
          ),
        ],
        (record) => record.expense.createDate,
      ).reverse(),
      (record) => record.expense.issueDate,
    ).reverse();

    projectsStore.$dispose();
  };

  buidHasParentExpenseLink.value = (expense: Expense, parent: Project) =>
    `/project-expenses/${parent.urlFriendlyName}/${expense.code.replaceAll('.', '_')}`;

  return {
    ...$p,
  };
}
