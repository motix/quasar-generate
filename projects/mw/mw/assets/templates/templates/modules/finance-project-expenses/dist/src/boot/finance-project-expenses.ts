import { defineBoot } from '#q-app/wrappers';

import extensionRegistered from 'utils/finance/extensionRegistered.js';

import { extendProjectsStore } from 'stores/finance/Projects_ProjectExpenses.js';

import {
  expenseNewPageExtensions,
  expenseViewPageExtensions,
} from 'composables/finance/expense/useExpenseEditPage.js';
import {
  extendExpenseNewPage_ProjectExpenses,
  extendExpenseViewPage_ProjectExpenses,
} from 'composables/finance/expense/useExpenseEditPage_ProjectExpenses.js';
import { projectViewPageExtensions } from 'composables/finance/project/useProjectViewPage.js';
import { extendProjectViewPage_ProjectExpenses } from 'composables/finance/project/useProjectViewPage_ProjectExpenses.js';
import { extendProjectViewPage_ProjectInvoicesExpensesSupport } from 'composables/finance/project/useProjectViewPage_ProjectInvoicesExpensesSupport.js';

export default defineBoot(({ router }) => {
  // Projects store

  extendProjectsStore();

  // useProjectViewPage

  extensionRegistered(
    projectViewPageExtensions,
    extendProjectViewPage_ProjectInvoicesExpensesSupport,
    'extendProjectViewPage_ProjectInvoicesExpensesSupport must be registered before extendProjectViewPage_ProjectExpenses',
  ) && projectViewPageExtensions.push(extendProjectViewPage_ProjectExpenses);

  // useExpenseEditPage

  expenseNewPageExtensions.push(
    // viewModelBeforeCreateActions and viewModelBeforeCreate made casting required
    extendExpenseNewPage_ProjectExpenses as (typeof expenseNewPageExtensions)[number],
  );

  expenseViewPageExtensions.push(
    // modelBeforeUpdateActions and modelBeforeUpdate made casting required
    extendExpenseViewPage_ProjectExpenses as (typeof expenseViewPageExtensions)[number],
  );

  // Project Expenses

  router.addRoute('MainLayout', {
    path: 'project-expenses',
    meta: { mainTransitionKey: 'project-expenses' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Project Expenses' },
        component: () => import('pages/project-expenses/IndexPage.vue'),
      },
      {
        path: ':parentFindKey/new',
        meta: {
          pageTitle: 'New Project Expense',
          isNoReturnPage: true,
          returnRequired: true,
        },
        component: () => import('pages/project-expenses/NewProjectExpense.vue'),
      },
      {
        path: ':parentFindKey/:findKey?',
        meta: { pageTitle: 'Project Expense', returnRequired: true },
        component: () => import('pages/project-expenses/ViewProjectExpense.vue'),
      },
    ],
  });
});
