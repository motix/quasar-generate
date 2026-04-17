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

  // Timesheets

  router.addRoute('MainLayout', {
    path: 'timesheets',
    meta: { pageTitle: 'Timesheets', roles: ['production'] },
    component: () => import('pages/timesheets/IndexPage.vue'),
  });

  router.addRoute('PrintLayout', {
    path: 'timesheets/:year/:month/print-timesheet',
    meta: { pageTitle: 'Timesheet', roles: ['finance'] },
    component: () => import('pages/timesheets/PrintTimesheet.vue'),
  });
});
