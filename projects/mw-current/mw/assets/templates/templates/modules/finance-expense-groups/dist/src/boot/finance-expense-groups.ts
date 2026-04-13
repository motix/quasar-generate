import { defineBoot } from '#q-app/wrappers';

import {
  expenseEditPageComponentStore,
  expenseNewPageExtensions,
  expenseViewPageExtensions,
} from 'composables/finance/expense/useExpenseEditPage.js';
import {
  extendExpenseNewPage_ExpenseGroups,
  extendExpenseViewPage_ExpenseGroups,
} from 'composables/finance/expense/useExpenseEditPage_ExpenseGroups.js';

import ExpenseEditorMain_ExpenseGroups from 'components/Expense/ExpenseEditorMain_ExpenseGroups.vue';
import ExpenseViewer_ExpenseGroups from 'components/Expense/ExpenseViewer_ExpenseGroups.vue';

export default defineBoot(({ router }) => {
  // useExpenseEditPage

  expenseNewPageExtensions.push(
    // viewModelBeforeCreateActions and viewModelBeforeCreate made casting required
    extendExpenseNewPage_ExpenseGroups as (typeof expenseNewPageExtensions)[number],
  );
  expenseViewPageExtensions.push(
    // modelBeforeUpdateActions and modelBeforeUpdate made casting required
    extendExpenseViewPage_ExpenseGroups as (typeof expenseViewPageExtensions)[number],
  );
  expenseEditPageComponentStore.expenseViewer = ExpenseViewer_ExpenseGroups;
  expenseEditPageComponentStore.expenseEditorMain = ExpenseEditorMain_ExpenseGroups;

  // Expense Groups

  router.addRoute('MainLayout', {
    path: 'expense-groups',
    meta: { mainTransitionKey: 'expense-groups' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Expense Groups' },
        component: () => import('pages/expense-groups/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: {
          pageTitle: 'New Expense Group',
          isNoReturnPage: true,
        },
        component: () => import('pages/expense-groups/NewExpenseGroup.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'Expense Group', returnRequired: true },
        component: () => import('pages/expense-groups/ViewExpenseGroup.vue'),
      },
    ],
  });
});
