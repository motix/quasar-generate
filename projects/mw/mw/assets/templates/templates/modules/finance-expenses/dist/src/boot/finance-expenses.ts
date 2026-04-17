import { defineBoot } from '#q-app/wrappers';

import {
  transactionNewPageExtensions,
  transactionViewPageExtensions,
} from 'composables/finance/transaction/useTransactionEditPage.js';
import {
  extendTransactionNewPage_Expenses,
  extendTransactionViewPage_Expenses,
} from 'composables/finance/transaction/useTransactionEditPage_Expenses.js';

export default defineBoot(({ router }) => {
  // useTransactionEditPage

  transactionNewPageExtensions.push(extendTransactionNewPage_Expenses);
  transactionViewPageExtensions.push(extendTransactionViewPage_Expenses);

  // General Expenses

  router.addRoute('MainLayout', {
    path: 'general-expenses',
    meta: { mainTransitionKey: 'general-expenses' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'General Expenses' },
        component: () => import('pages/general-expenses/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: {
          pageTitle: 'New General Expense',
          isNoReturnPage: true,
        },
        component: () => import('pages/general-expenses/NewGeneralExpense.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'General Expense', returnRequired: true },
        component: () => import('pages/general-expenses/ViewGeneralExpense.vue'),
      },
    ],
  });

  // General Expense Transactions

  router.addRoute('MainLayout', {
    path: 'general-expense-transactions',
    meta: { mainTransitionKey: 'general-expense-transactions' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'General Expense Transactions' },
        component: () => import('pages/general-expense-transactions/IndexPage.vue'),
      },
      {
        path: ':parentFindKey/new',
        meta: {
          pageTitle: 'New General Expense Transaction',
          isNoReturnPage: true,
          returnRequired: true,
        },
        component: () =>
          import('pages/general-expense-transactions/NewGeneralExpenseTransaction.vue'),
      },
      {
        path: ':parentFindKey/:findKey?',
        meta: {
          pageTitle: 'General Expense Transaction',
          returnRequired: true,
        },
        component: () =>
          import('pages/general-expense-transactions/ViewGeneralExpenseTransaction.vue'),
      },
    ],
  });
});
