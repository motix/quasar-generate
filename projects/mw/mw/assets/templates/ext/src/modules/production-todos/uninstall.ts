// removeTree(api, './templates/dist', ['src/components/Todo', 'src/pages/todos']);
import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/Todo', 'src/composables/production/todo', 'src/pages/todos'],
    removeIfEmpty: [
      'src/composables/production',
      'src/models/production/mapper',
      'src/models/production',
      'src/stores/production',
    ],
  });
});
