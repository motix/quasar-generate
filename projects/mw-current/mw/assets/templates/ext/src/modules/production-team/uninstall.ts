import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/Member', 'src/pages/team'],
    removeIfEmpty: [
      'src/composables/production/shared',
      'src/composables/production',
      'src/models/production/mapper',
      'src/models/production',
      'src/stores/production',
    ],
  });
});
