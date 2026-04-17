import { h } from 'vue';
import { RouterView } from 'vue-router';

import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Payable

  router.addRoute('MainLayout', {
    path: 'payable',
    component: { render: () => h(RouterView) },
    children: [
      {
        path: '',
        meta: { pageTitle: 'Payable Report' },
        component: () => import('pages/payable/IndexPage.vue'),
      },
    ],
  });
});
