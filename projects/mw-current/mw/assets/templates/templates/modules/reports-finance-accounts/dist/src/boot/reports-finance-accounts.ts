import { h } from 'vue';
import { RouterView } from 'vue-router';

import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Finance Accounts

  router.addRoute('MainLayout', {
    path: 'finance-accounts',
    component: { render: () => h(RouterView) },
    children: [
      {
        path: '',
        meta: { pageTitle: 'Finance Accounts Reports' },
        component: () => import('pages/finance-accounts/IndexPage.vue'),
      },
    ],
  });
});
