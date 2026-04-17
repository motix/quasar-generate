import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/Todo', 'src/composables/finance/todo', 'src/pages/todos'],
    removeIfEmpty: [
      'src/composables/finance',
      'src/models/finance/mapper',
      'src/models/finance',
      'src/stores/finance',
    ],
  });
});
