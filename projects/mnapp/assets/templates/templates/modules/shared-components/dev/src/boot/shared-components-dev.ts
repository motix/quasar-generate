import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  router.addRoute({
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: '/shared-components',
        component: () => import('pages/SharedComponents.vue'),
      },
      {
        path: '/shared-components-input',
        component: () => import('pages/SharedComponentsInput.vue'),
      },
    ],
  });
});
