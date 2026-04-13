import { defineBoot } from '#q-app/wrappers';

import useConfig from 'composables/useConfig.js';

declare module 'composables/useConfig.js' {
  interface Config {
    financeUrl?: string;
  }
}

const host = window.location.hostname;

export default defineBoot(({ router }) => {
  const config = useConfig();

  // URLs

  switch (process.env.FIREBASE_ENV) {
    case 'DEV':
      config.financeUrl = `http://${host}:9004`;
      break;
    case 'STAGE':
      config.financeUrl = 'https://motiwiki-2022-finance.web.app';
      break;
    case 'PROD':
      config.financeUrl = 'https://finance.motiteam.com';
      break;
    default:
      throw new Error(`FIREBASE_ENV '${String(process.env.FIREBASE_ENV)}' not reconized.`);
  }

  // Projects

  router.addRoute('MainLayout', {
    path: 'projects',
    meta: { mainTransitionKey: 'projects', roles: ['production'] },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Projects' },
        component: () => import('pages/projects/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: {
          pageTitle: 'New Project',
          isNoReturnPage: true,
          roles: ['project-leader'],
        },
        component: () => import('pages/projects/NewProject.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'Project', returnRequired: true },
        component: () => import('pages/projects/ViewProject.vue'),
      },
    ],
  });
});
