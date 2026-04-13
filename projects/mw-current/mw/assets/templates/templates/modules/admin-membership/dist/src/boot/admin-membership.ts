import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Team

  router.addRoute('MainLayout', {
    path: 'team',
    meta: { mainTransitionKey: 'team' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Team' },
        component: () => import('pages/team/IndexPage.vue'),
      },
      {
        path: 'new-member',
        meta: { pageTitle: 'New Member', isNoReturnPage: true },
        component: () => import('pages/team/NewMember.vue'),
      },
      {
        path: 'member/:findKey',
        meta: { pageTitle: 'Member', returnRequired: true },
        component: () => import('pages/team/ViewMember.vue'),
      },
    ],
  });

  // Accounts

  router.addRoute('MainLayout', {
    path: 'accounts',
    meta: { mainTransitionKey: 'accounts' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Accounts' },
        component: () => import('pages/accounts/IndexPage.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'Account', returnRequired: true },
        component: () => import('pages/accounts/ViewAccount.vue'),
      },
    ],
  });
});
