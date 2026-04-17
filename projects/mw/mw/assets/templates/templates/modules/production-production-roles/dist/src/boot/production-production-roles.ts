import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Production Roles

  router.addRoute('MainLayout', {
    path: 'production-roles',
    meta: {
      mainTransitionKey: 'production-roles',
      roles: ['maintenance', 'project-leader'],
    },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Production Roles' },
        component: () => import('pages/production-roles/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: {
          pageTitle: 'New Production Role',
          isNoReturnPage: true,
          roles: ['maintenance'],
        },
        component: () => import('pages/production-roles/NewProductionRole.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'Production Role', returnRequired: true },
        component: () => import('pages/production-roles/ViewProductionRole.vue'),
      },
    ],
  });
});
