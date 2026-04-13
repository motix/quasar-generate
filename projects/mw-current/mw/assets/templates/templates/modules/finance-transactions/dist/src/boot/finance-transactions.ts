import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // General Transactions

  router.addRoute('MainLayout', {
    path: 'general-transactions',
    meta: { mainTransitionKey: 'general-transactions' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'General Transactions' },
        component: () => import('pages/general-transactions/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: {
          pageTitle: 'New General Transaction',
          isNoReturnPage: true,
        },
        component: () => import('pages/general-transactions/NewGeneralTransaction.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'General Transaction', returnRequired: true },
        component: () => import('pages/general-transactions/ViewGeneralTransaction.vue'),
      },
    ],
  });
});
