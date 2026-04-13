// sort-imports-ignore

import { defineBoot } from '#q-app/wrappers';

import useConfig from 'composables/useConfig.js';

// <% if (config.hasModule('shared-tasks')) { %>•+ shared-tasks
import { buildTasksStatusesExtensions } from 'utils/tasks/tasksDocumentStatus.js';
// •- /shared-tasks<% } else { %>•! shared-tasks absent<% } %>

declare module 'composables/useConfig.js' {
  interface Config {
    portalUrl?: string;
  }
}

const host = window.location.hostname;

export default defineBoot(({ router }) => {
  const config = useConfig();

  // <% if (config.hasModule('shared-tasks')) { %>•+ shared-tasks
  // tasksDocumentStatus

  buildTasksStatusesExtensions.push((buttonOverrides) => {
    for (const key in buttonOverrides) {
      const button = buttonOverrides[key as keyof typeof buttonOverrides];

      if (button) {
        button.roles = ['production'];
      }
    }
  });
  // •- /shared-tasks<% } else { %>•! shared-tasks absent<% } %>

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

  // Config

  config.firstYear = 2016;

  // MainLayout

  const mainLayoutRoute = router.getRoutes().find((value) => value.name === 'MainLayout');

  if (mainLayoutRoute) {
    mainLayoutRoute.meta = {
      ...mainLayoutRoute.meta,

      requiresAuth: true,
      roles: ['production', 'maintenance'],
    };
  }

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
