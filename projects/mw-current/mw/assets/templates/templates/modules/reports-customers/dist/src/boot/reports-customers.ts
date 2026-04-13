import { h } from 'vue';
import { RouterView } from 'vue-router';

import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Customers

  router.addRoute('MainLayout', {
    path: 'customers',
    component: { render: () => h(RouterView) },
    children: [
      {
        path: '',
        meta: { pageTitle: 'Customers Reports' },
        component: () => import('pages/customers/IndexPage.vue'),
      },
    ],
  });
});
