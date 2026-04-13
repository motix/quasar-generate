import { h } from 'vue';
import { RouterView } from 'vue-router';

import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Suppliers

  router.addRoute('MainLayout', {
    path: 'suppliers',
    component: { render: () => h(RouterView) },
    children: [
      {
        path: '',
        meta: { pageTitle: 'Suppliers Reports' },
        component: () => import('pages/suppliers/IndexPage.vue'),
      },
    ],
  });
});
