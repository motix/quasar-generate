import type { RouteRecordRaw } from 'vue-router';

import { defineBoot } from '#q-app/wrappers';

import helpMds from 'pages/help/listing.js';

export default defineBoot(({ router }) => {
  const helpPages = Object.keys(helpMds)
    .filter((value) => !['./index.md'].includes(value))
    .map((key) => {
      const parts = key.substring(2, key.length - 3).split('/');
      const len = parts.length;
      const path = parts[len - 2] === parts[len - 1] ? parts.slice(0, len - 1) : parts;

      const route: RouteRecordRaw = {
        path: path.join('/'),
        meta: { md: helpMds[key]! },
        component: async () => (await helpMds[key]!()).VueComponent,
      };

      return route;
    });

  // Help

  router.addRoute('MainLayout', {
    path: 'help',
    meta: { mainTransitionKey: 'help', pageTitle: 'Help' },
    component: () => import('layouts/DocumentationLayout.vue'),
    children: [
      {
        path: '',
        meta: {
          md:
            helpMds['./index.md'] ||
            (() => {
              throw new Error('[finance-help] index.md not found ');
            })(),
        },
        component: async () =>
          (
            await (
              helpMds['./index.md'] ||
              (() => {
                throw new Error('[finance-help] index.md not found ');
              })()
            )()
          ).VueComponent,
      },
      ...helpPages,
    ],
  });
});
