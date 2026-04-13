import { defineBoot } from '#q-app/wrappers';

import { extendProjectsStore } from 'stores/finance/Projects_Quotations.js';

import { projectViewPageExtensions } from 'composables/finance/project/useProjectViewPage.js';
import { extendProjectViewPage_Quotations } from 'composables/finance/project/useProjectViewPage_Quotations.js';

export default defineBoot(({ router }) => {
  // Projects store

  extendProjectsStore();

  // useProjectViewPage

  projectViewPageExtensions.push(extendProjectViewPage_Quotations);

  // Quotations

  router.addRoute('MainLayout', {
    path: 'quotations',
    meta: { mainTransitionKey: 'quotations' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Quotations' },
        component: () => import('pages/quotations/IndexPage.vue'),
      },
      {
        path: ':parentFindKey/:findKey?',
        meta: { pageTitle: 'Quotation', returnRequired: true },
        component: () => import('pages/quotations/ViewQuotation.vue'),
      },
    ],
  });

  router.addRoute('PrintLayout', {
    path: 'quotations/:parentFindKey/:findKey/print-quotation',
    meta: { pageTitle: 'Quotation', roles: ['finance'] },
    component: () => import('pages/quotations/PrintQuotation.vue'),
  });
});
