import { defineBoot } from '#q-app/wrappers';

import extensionRegistered from 'utils/finance/extensionRegistered.js';

import {
  expenseNewPageExtensions,
  expenseViewPageExtensions,
} from 'composables/finance/expense/useExpenseEditPage.js';
import {
  extendExpenseNewPage_ExpenseGroups,
  extendExpenseViewPage_ExpenseGroups,
} from 'composables/finance/expense/useExpenseEditPage_ExpenseGroups.js';
import {
  extendExpenseNewPage_ProjectExpenseGroups,
  extendExpenseViewPage_ProjectExpenseGroups,
} from 'composables/finance/expense/useExpenseEditPage_ProjectExpenseGroups.js';
import {
  extendExpenseNewPage_ProjectExpenses,
  extendExpenseViewPage_ProjectExpenses,
  projectExpenseEditPageComponentStore,
} from 'composables/finance/expense/useExpenseEditPage_ProjectExpenses.js';

import ExpenseEditorMain_ProjectExpenseGroups from 'components/Expense/ExpenseEditorMain_ProjectExpenseGroups.vue';
import ExpenseViewer_ProjectExpenseGroups from 'components/Expense/ExpenseViewer_ProjectExpenseGroups.vue';

export default defineBoot(() => {
  // useExpenseEditPage

  extensionRegistered(
    expenseNewPageExtensions,
    extendExpenseNewPage_ExpenseGroups,
    'extendExpenseNewPage_ExpenseGroups must be registered before extendExpenseNewPage_ProjectExpenseGroups',
  ) &&
    extensionRegistered(
      expenseNewPageExtensions,
      extendExpenseNewPage_ProjectExpenses,
      'extendExpenseNewPage_ProjectExpenses must be registered before extendExpenseNewPage_ProjectExpenseGroups',
    ) &&
    expenseNewPageExtensions.push(extendExpenseNewPage_ProjectExpenseGroups);

  extensionRegistered(
    expenseViewPageExtensions,
    extendExpenseViewPage_ExpenseGroups,
    'extendExpenseViewPage_ExpenseGroups must be registered before extendExpenseViewPage_ProjectExpenseGroups',
  ) &&
    extensionRegistered(
      expenseViewPageExtensions,
      extendExpenseViewPage_ProjectExpenses,
      'extendExpenseViewPage_ProjectExpenses must be registered before extendExpenseViewPage_ProjectExpenseGroups',
    ) &&
    expenseViewPageExtensions.push(extendExpenseViewPage_ProjectExpenseGroups);

  projectExpenseEditPageComponentStore.projectExpenseViewer = ExpenseViewer_ProjectExpenseGroups;
  projectExpenseEditPageComponentStore.projectExpenseEditorMain =
    ExpenseEditorMain_ProjectExpenseGroups;
});
