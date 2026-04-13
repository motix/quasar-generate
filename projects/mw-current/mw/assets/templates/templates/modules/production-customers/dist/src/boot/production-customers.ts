import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Customers

  router.addRoute('MainLayout', {
    path: 'customers',
    meta: { mainTransitionKey: 'customers', roles: ['project-leader'] },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Customers' },
        component: () => import('pages/customers/IndexPage.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'Customer', returnRequired: true },
        component: () => import('pages/customers/ViewCustomer.vue'),
      },
    ],
  });
});
