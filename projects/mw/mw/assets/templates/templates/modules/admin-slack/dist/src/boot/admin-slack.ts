import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Slack

  router.addRoute('MainLayout', {
    path: 'slack',
    meta: { pageTitle: 'Slack' },
    component: () => import('pages/SlackPage.vue'),
  });
});
