import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Finance Accounts

  router.addRoute('MainLayout', {
    path: 'finance-accounts',
    meta: { mainTransitionKey: 'finance-accounts' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Finance Accounts' },
        component: () => import('pages/finance-accounts/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: {
          pageTitle: 'New Finance Account',
          isNoReturnPage: true,
        },
        component: () => import('pages/finance-accounts/NewFinanceAccount.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'Finance Account', returnRequired: true },
        component: () => import('pages/finance-accounts/ViewFinanceAccount.vue'),
      },
    ],
  });
});
