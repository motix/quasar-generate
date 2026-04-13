import { defineBoot } from '#q-app/wrappers';

import useConfig from 'composables/useConfig.js';

declare module 'composables/useConfig.js' {
  interface Config {
    portalUrl?: string;
  }
}

const host = window.location.hostname;

export default defineBoot(({ router }) => {
  const config = useConfig();

  // Firebase region

  config.firebaseRegion = 'asia-southeast2';

  // URLs

  switch (process.env.FIREBASE_ENV) {
    case 'DEV':
      config.portalUrl = `http://${host}:9001`;
      break;
    case 'STAGE':
      config.portalUrl = 'https://motiwiki-2022.web.app';
      break;
    case 'PROD':
      config.portalUrl = 'https://motiteam.com';
      break;
    default:
      throw new Error(`FIREBASE_ENV '${String(process.env.FIREBASE_ENV)}' not reconized.`);
  }

  // MainLayout

  const mainLayoutRoute = router.getRoutes().find((value) => value.name === 'MainLayout');

  if (mainLayoutRoute) {
    mainLayoutRoute.meta = {
      ...mainLayoutRoute.meta,

      requiresAuth: true,
      roles: ['admin', 'maintenance'],
    };
  }

  // Run Server Function

  router.addRoute('MainLayout', {
    path: 'runServerFunction',
    meta: {
      pageTitle: 'Run Server Function',
      roles: ['admin'],
    },
    component: () => import('pages/RunServerFunction.vue'),
  });

  // Seed

  router.addRoute('MainLayout', {
    path: 'seed',
    meta: {
      pageTitle: 'Seed',
      roles: ['admin'],
    },
    component: () => import('pages/SeedPage.vue'),
  });
});
