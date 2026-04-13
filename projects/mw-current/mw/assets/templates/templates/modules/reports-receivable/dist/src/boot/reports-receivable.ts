import { h } from 'vue';
import { RouterView } from 'vue-router';

import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Receivable

  router.addRoute('MainLayout', {
    path: 'receivable',
    component: { render: () => h(RouterView) },
    children: [
      {
        path: '',
        meta: { pageTitle: 'Receivable Report' },
        component: () => import('pages/receivable/IndexPage.vue'),
      },
    ],
  });
});
