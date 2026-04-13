import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/Supplier',
      'src/composables/reports/supplier',
      'src/pages/suppliers',
    ],
    removeIfEmpty: [
      'src/composables/reports',
      'src/models/reports',
      'src/stores/reports',
      'src/utils/reports',
    ],
  });
});
