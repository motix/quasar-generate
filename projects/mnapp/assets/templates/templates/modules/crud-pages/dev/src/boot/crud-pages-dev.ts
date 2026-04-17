import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  router.addRoute({
    path: '/',
    component: () => import('layouts/CrudPagesLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: '/crud-pages',
        component: () => import('layouts/AliveSubLayout.vue'),
        children: [
          {
            path: '',
            meta: { pageTitle: 'Team' },
            component: () => import('pages/crud-pages/IndexPage.vue'),
          },
          {
            path: 'new-member',
            meta: { pageTitle: 'New Member', isNoReturnPage: true },
            component: () => import('pages/crud-pages/NewMember.vue'),
          },
          {
            path: ':findKey',
            meta: { pageTitle: 'Member', returnRequired: true },
            component: () => import('pages/crud-pages/ViewMember.vue'),
          },
        ],
      },
    ],
  });
});
