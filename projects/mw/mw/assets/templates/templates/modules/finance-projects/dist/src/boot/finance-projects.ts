import { defineBoot } from '#q-app/wrappers';

import useConfig from 'composables/useConfig.js';

declare module 'composables/useConfig.js' {
  interface Config {
    productionUrl?: string;
  }
}

const host = window.location.hostname;

export default defineBoot(({ router }) => {
  const config = useConfig();

  // URLs

  switch (process.env.FIREBASE_ENV) {
    case 'DEV':
      config.productionUrl = `http://${host}:9003`;
      break;
    case 'STAGE':
      config.productionUrl = 'https://motiwiki-2022-production.web.app';
      break;
    case 'PROD':
      config.productionUrl = 'https://production.motiteam.com';
      break;
    default:
      throw new Error(`FIREBASE_ENV '${String(process.env.FIREBASE_ENV)}' not reconized.`);
  }

  // Projects

  router.addRoute('MainLayout', {
    path: 'projects',
    meta: { mainTransitionKey: 'projects' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Projects' },
        component: () => import('pages/projects/IndexPage.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'Project', returnRequired: true },
        component: () => import('pages/projects/ViewProject.vue'),
      },
    ],
  });
});
