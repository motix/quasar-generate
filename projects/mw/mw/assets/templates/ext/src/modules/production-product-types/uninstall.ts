import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/ProductType', 'src/pages/product-types'],
    removeIfEmpty: [
      'src/composables/production/shared',
      'src/composables/production',
      'src/models/production/mapper',
      'src/models/production',
      'src/services/seed',
      'src/stores/production',
    ],
  });
});
