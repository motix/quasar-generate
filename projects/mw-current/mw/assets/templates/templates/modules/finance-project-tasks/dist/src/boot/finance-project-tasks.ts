import { defineBoot } from '#q-app/wrappers';

import { extendProjectsStore } from 'stores/finance/Projects_ProjectTasks.js';

export default defineBoot(({ router }) => {
  // Projects store

  extendProjectsStore();

  // Project Tasks

  router.addRoute('MainLayout', {
    path: 'project-tasks',
    meta: { mainTransitionKey: 'project-tasks' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Project Tasks' },
        component: () => import('pages/project-tasks/IndexPage.vue'),
      },
      {
        path: ':findKey/:childKey?',
        meta: { pageTitle: 'Project Task', returnRequired: true },
        component: () => import('pages/project-tasks/ViewProjectTasks.vue'),
      },
    ],
  });
});
