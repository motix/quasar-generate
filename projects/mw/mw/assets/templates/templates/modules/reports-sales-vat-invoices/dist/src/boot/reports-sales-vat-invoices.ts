import { h } from 'vue';
import { RouterView } from 'vue-router';

import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  //

  router.addRoute('MainLayout', {
    path: 'sales-vat-invoices',
    component: { render: () => h(RouterView) },
    children: [
      {
        path: '',
        meta: { pageTitle: 'Sales VAT Invoices Reports' },
        component: () => import('pages/sales-vat-invoices/IndexPage.vue'),
      },
    ],
  });
});
