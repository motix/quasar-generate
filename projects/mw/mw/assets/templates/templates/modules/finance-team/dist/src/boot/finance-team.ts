import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Team

  router.addRoute('MainLayout', {
    path: 'team',
    meta: { mainTransitionKey: 'team', roles: ['finance'] },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Team' },
        component: () => import('pages/team/IndexPage.vue'),
      },
      {
        path: 'member/:findKey',
        meta: { pageTitle: 'Member', returnRequired: true },
        component: () => import('pages/team/ViewMember.vue'),
      },
    ],
  });
});
