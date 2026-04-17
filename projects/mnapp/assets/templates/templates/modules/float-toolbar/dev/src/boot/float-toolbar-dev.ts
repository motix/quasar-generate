import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  router.addRoute({
    path: '/',
    component: () => import('layouts/FloatToolbarLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: '/float-toolbar',
        component: () => import('pages/FloatToolbar.vue'),
      },
    ],
  });
});
