import { h } from 'vue';
import { RouterView } from 'vue-router';

import { defineBoot } from '#q-app/wrappers';

import useConfig from 'composables/useConfig.js';

declare module 'composables/useConfig.js' {
  interface Config {
    payday?: number;
  }
}

export default defineBoot(({ router }) => {
  const config = useConfig();

  // Config

  config.payday = 20;

  // Projects

  router.addRoute('MainLayout', {
    path: 'projects',
    component: { render: () => h(RouterView) },
    children: [
      {
        path: 'monthly-profit-ratio-reports',
        meta: {
          roles: ['manager'],
          pageTitle: 'Projects Production Ratio Reports',
        },
        component: () => import('pages/projects/ProjectsProductionRatioReports.vue'),
      },
      {
        path: 'monthly-reports',
        meta: { pageTitle: 'Projects Monthly Reports' },
        component: () => import('pages/projects/ProjectsMonthlyReports.vue'),
      },
      {
        path: 'yearly-reports',
        meta: { pageTitle: 'Projects Yearly Reports' },
        component: () => import('pages/projects/ProjectsYearlyReports.vue'),
      },
      {
        path: 'all-years-report',
        meta: { pageTitle: 'Projects All Years Report' },
        component: () => import('pages/projects/ProjectsAllYearsReport.vue'),
      },
    ],
  });
});
