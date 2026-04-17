import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  router.addRoute({
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/multi-views', component: () => import('pages/MultiViews.vue') },
    ],
  });
});
