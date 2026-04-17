import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/Project',
      'src/composables/production/project',
      'src/pages/projects',
      'src/utils/production/Project',
    ],
    removeIfEmpty: [
      'src/composables/production',
      'src/models/production/mapper',
      'src/models/production',
      'src/services/seed',
      'src/stores/production',
      'src/utils/production',
    ],
  });
});
