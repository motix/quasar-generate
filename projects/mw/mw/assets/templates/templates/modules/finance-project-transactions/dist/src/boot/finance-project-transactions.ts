import { defineBoot } from '#q-app/wrappers';

import extensionRegistered from 'utils/finance/extensionRegistered.js';

import {
  transactionNewPageExtensions,
  transactionViewPageExtensions,
} from 'composables/finance/transaction/useTransactionEditPage.js';
import {
  extendTransactionNewPage_Expenses,
  extendTransactionViewPage_Expenses,
} from 'composables/finance/transaction/useTransactionEditPage_Expenses.js';
import {
  extendTransactionNewPage_Invoices,
  extendTransactionViewPage_Invoices,
} from 'composables/finance/transaction/useTransactionEditPage_Invoices.js';
import {
  extendTransactionNewPage_ProjectTransactions,
  extendTransactionViewPage_ProjectTransactions,
} from 'composables/finance/transaction/useTransactionEditPage_ProjectTransactions.js';

export default defineBoot(({ router }) => {
  // useTransactionEditPage

  extensionRegistered(
    transactionNewPageExtensions,
    extendTransactionNewPage_Invoices,
    'extendTransactionNewPage_Invoices must be registered before extendTransactionNewPage_ProjectTransactions',
  ) &&
    extensionRegistered(
      transactionNewPageExtensions,
      extendTransactionNewPage_Expenses,
      'extendTransactionNewPage_Expenses must be registered before extendTransactionNewPage_ProjectTransactions',
    ) &&
    transactionNewPageExtensions.push(extendTransactionNewPage_ProjectTransactions);

  extensionRegistered(
    transactionViewPageExtensions,
    extendTransactionViewPage_Invoices,
    'extendTransactionViewPage_Invoices must be registered before extendTransactionViewPage_ProjectTransactions',
  ) &&
    extensionRegistered(
      transactionViewPageExtensions,
      extendTransactionViewPage_Expenses,
      'extendTransactionViewPage_Expenses must be registered before extendTransactionViewPage_ProjectTransactions',
    ) &&
    transactionViewPageExtensions.push(extendTransactionViewPage_ProjectTransactions);

  // Project Transactions

  router.addRoute('MainLayout', {
    path: 'project-transactions',
    meta: { mainTransitionKey: 'project-transactions' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Project Transactions' },
        component: () => import('pages/project-transactions/IndexPage.vue'),
      },
      {
        path: ':parentFindKey/:directParentFindKey/new',
        meta: {
          pageTitle: 'New Project Transaction',
          isNoReturnPage: true,
          returnRequired: true,
        },
        component: () => import('pages/project-transactions/NewProjectTransaction.vue'),
      },
      {
        path: ':parentFindKey/:findKey?',
        meta: { pageTitle: 'Project Transaction', returnRequired: true },
        component: () => import('pages/project-transactions/ViewProjectTransaction.vue'),
      },
    ],
  });
});
