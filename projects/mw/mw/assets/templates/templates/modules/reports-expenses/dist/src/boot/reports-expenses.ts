import { h } from 'vue';
import { RouterView } from 'vue-router';

import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Finance Accounts

  router.addRoute('MainLayout', {
    path: 'expenses',
    component: { render: () => h(RouterView) },
    children: [
      {
        path: '',
        meta: { pageTitle: 'Expenses Reports' },
        component: () => import('pages/expenses/IndexPage.vue'),
      },
    ],
  });
});
