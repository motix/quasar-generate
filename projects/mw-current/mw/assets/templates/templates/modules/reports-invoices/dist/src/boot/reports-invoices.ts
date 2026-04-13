import { h } from 'vue';
import { RouterView } from 'vue-router';

import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Finance Accounts

  router.addRoute('MainLayout', {
    path: 'invoices',
    component: { render: () => h(RouterView) },
    children: [
      {
        path: '',
        meta: { pageTitle: 'Invoices Reports' },
        component: () => import('pages/invoices/IndexPage.vue'),
      },
    ],
  });
});
