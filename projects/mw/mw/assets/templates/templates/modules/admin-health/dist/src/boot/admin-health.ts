import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Health

  router.addRoute('MainLayout', {
    path: 'health',
    meta: { pageTitle: 'Health' },
    component: () => import('pages/HealthPage.vue'),
  });
});
