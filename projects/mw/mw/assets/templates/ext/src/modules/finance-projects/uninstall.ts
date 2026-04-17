import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/Project',
      'src/composables/finance/project',
      'src/pages/projects',
      'src/utils/finance/Project',
    ],
    removeIfEmpty: [
      'src/composables/finance',
      'src/models/finance/mapper',
      'src/models/finance',
      'src/services/finance',
      'src/stores/finance',
      'src/utils/finance',
    ],
  });
});
