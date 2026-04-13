import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/ProductionRole', 'src/pages/production-roles'],
    removeIfEmpty: [
      'src/models/production/mapper',
      'src/models/production',
      'src/services/seed',
      'src/stores/production',
    ],
  });
});
