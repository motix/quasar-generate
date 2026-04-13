import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // PrintLayout

  router.addRoute({
    name: 'PrintLayout',
    path: '/',
    meta: { requiresAuth: true },
    component: () => import('layouts/PrintLayout.vue'),
    children: [],
  });
});
