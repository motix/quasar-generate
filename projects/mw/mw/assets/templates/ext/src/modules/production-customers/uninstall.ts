import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/Customer', 'src/pages/customers'],
    removeIfEmpty: [
      'src/composables/production/shared',
      'src/models/production/mapper',
      'src/models/production',
      'src/stores/production',
    ],
  });
});
