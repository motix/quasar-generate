import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  // Todos

  router.addRoute('MainLayout', {
    path: 'todos',
    meta: { mainTransitionKey: 'todos', roles: ['production'] },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Todos' },
        component: () => import('pages/todos/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: {
          pageTitle: 'New Todo',
          isNoReturnPage: true,
          roles: ['project-leader'],
        },
        component: () => import('pages/todos/NewTodo.vue'),
      },
      {
        path: ':findKey/:childKey?',
        meta: { pageTitle: 'Todo', returnRequired: true },
        component: () => import('pages/todos/ViewTodo.vue'),
      },
    ],
  });
});
