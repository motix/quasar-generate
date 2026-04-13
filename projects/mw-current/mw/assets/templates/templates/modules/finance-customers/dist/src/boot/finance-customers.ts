import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Customers

  router.addRoute('MainLayout', {
    path: 'customers',
    meta: { mainTransitionKey: 'customers' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Customers' },
        component: () => import('pages/customers/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: {
          pageTitle: 'New Customer',
          isNoReturnPage: true,
        },
        component: () => import('pages/customers/NewCustomer.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'Customer', returnRequired: true },
        component: () => import('pages/customers/ViewCustomer.vue'),
      },
    ],
  });
});
