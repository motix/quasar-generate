import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/Supplier', 'src/pages/suppliers'],
    removeIfEmpty: [
      'src/composables/finance/shared',
      'src/composables/finance',
      'src/models/finance/mapper',
      'src/models/finance',
      'src/services/seed',
      'src/stores/finance',
    ],
  });
});
