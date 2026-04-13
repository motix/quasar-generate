import { h } from 'vue';
import { RouterView } from 'vue-router';

import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Finance Details

  router.addRoute('MainLayout', {
    path: 'finance-details',
    component: { render: () => h(RouterView) },
    children: [
      {
        path: 'monthly-reports',
        meta: { pageTitle: 'Finance Details Monthly Reports' },
        component: () => import('pages/finance-details/FinanceDetailsMonthlyReports.vue'),
      },
      {
        path: 'yearly-reports',
        meta: { pageTitle: 'Finance Details Yearly Reports' },
        component: () => import('pages/finance-details/FinanceDetailsYearlyReports.vue'),
      },
      {
        path: 'all-years-report',
        meta: { pageTitle: 'Finance Details All Years Report' },
        component: () => import('pages/finance-details/FinanceDetailsAllYearsReport.vue'),
      },
    ],
  });
});
