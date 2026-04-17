import { defineBoot } from '#q-app/wrappers';

import {
  transactionNewPageExtensions,
  transactionViewPageExtensions,
} from 'composables/finance/transaction/useTransactionEditPage.js';
import {
  extendTransactionNewPage_Invoices,
  extendTransactionViewPage_Invoices,
} from 'composables/finance/transaction/useTransactionEditPage_Invoices.js';

export default defineBoot(({ router }) => {
  // useTransactionEditPage

  transactionNewPageExtensions.push(extendTransactionNewPage_Invoices);
  transactionViewPageExtensions.push(extendTransactionViewPage_Invoices);

  // General Invoices

  router.addRoute('MainLayout', {
    path: 'general-invoices',
    meta: { mainTransitionKey: 'general-invoices' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'General Invoices' },
        component: () => import('pages/general-invoices/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: {
          pageTitle: 'New General Invoice',
          isNoReturnPage: true,
        },
        component: () => import('pages/general-invoices/NewGeneralInvoice.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'General Invoice', returnRequired: true },
        component: () => import('pages/general-invoices/ViewGeneralInvoice.vue'),
      },
    ],
  });

  // General Invoice Transactions

  router.addRoute('MainLayout', {
    path: 'general-invoice-transactions',
    meta: { mainTransitionKey: 'general-invoice-transactions' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'General Invoice Transactions' },
        component: () => import('pages/general-invoice-transactions/IndexPage.vue'),
      },
      {
        path: ':parentFindKey/new',
        meta: {
          pageTitle: 'New General Invoice Transaction',
          isNoReturnPage: true,
          returnRequired: true,
        },
        component: () =>
          import('pages/general-invoice-transactions/NewGeneralInvoiceTransaction.vue'),
      },
      {
        path: ':parentFindKey/:findKey?',
        meta: {
          pageTitle: 'General Invoice Transaction',
          returnRequired: true,
        },
        component: () =>
          import('pages/general-invoice-transactions/ViewGeneralInvoiceTransaction.vue'),
      },
    ],
  });
});
