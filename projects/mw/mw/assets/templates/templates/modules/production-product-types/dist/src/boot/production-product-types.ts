import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Product Types

  router.addRoute('MainLayout', {
    path: 'product-types',
    meta: {
      mainTransitionKey: 'product-types',
      roles: ['maintenance', 'project-leader'],
    },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Product Types' },
        component: () => import('pages/product-types/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: {
          pageTitle: 'New Product Type',
          isNoReturnPage: true,
          roles: ['maintenance'],
        },
        component: () => import('pages/product-types/NewProductType.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'Product Type', returnRequired: true },
        component: () => import('pages/product-types/ViewProductType.vue'),
      },
    ],
  });

  // Prcoduction Salary

  router.addRoute('MainLayout', {
    path: 'production-salary',
    meta: { pageTitle: 'Prcoduction Salary', roles: ['maintenance'] },
    component: () => import('pages/ProductionSalary.vue'),
  });
});
