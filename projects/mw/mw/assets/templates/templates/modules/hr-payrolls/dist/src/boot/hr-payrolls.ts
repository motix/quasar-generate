import { defineBoot } from '#q-app/wrappers';

import useConfig from 'composables/useConfig.js';

declare module 'composables/useConfig.js' {
  interface Config {
    payday?: number;
    defaultSocialInsurancePercent?: number;
    defaultUnionDuesPercent?: number;
  }
}

export default defineBoot(({ router }) => {
  const config = useConfig();

  // Config

  config.payday = 20;
  config.defaultSocialInsurancePercent = 0.105;
  config.defaultUnionDuesPercent = 0.005;

  // Payrolls

  router.addRoute('MainLayout', {
    path: 'payrolls',
    meta: { mainTransitionKey: 'payrolls' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Payrolls' },
        component: () => import('pages/payrolls/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: { pageTitle: 'New Payroll', isNoReturnPage: true },
        component: () => import('pages/payrolls/NewPayroll.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'Payroll', returnRequired: true },
        component: () => import('pages/payrolls/ViewPayroll.vue'),
      },
    ],
  });

  router.addRoute('PrintLayout', {
    path: 'payrolls/:findKey/print-payroll',
    meta: { pageTitle: 'Payroll', roles: ['hr'] },
    component: () => import('pages/payrolls/PrintPayroll.vue'),
  });
});
