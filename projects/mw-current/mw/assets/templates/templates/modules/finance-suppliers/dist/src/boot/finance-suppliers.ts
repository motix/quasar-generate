import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Suppliers

  router.addRoute('MainLayout', {
    path: 'suppliers',
    meta: { mainTransitionKey: 'suppliers' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Suppliers' },
        component: () => import('pages/suppliers/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: {
          pageTitle: 'New Supplier',
          isNoReturnPage: true,
        },
        component: () => import('pages/suppliers/NewSupplier.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'Supplier', returnRequired: true },
        component: () => import('pages/suppliers/ViewSupplier.vue'),
      },
    ],
  });
});
