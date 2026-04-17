import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/Customer',
      'src/composables/reports/customer',
      'src/pages/customers',
    ],
    removeIfEmpty: [
      'src/composables/reports',
      'src/models/reports',
      'src/stores/reports',
      'src/utils/reports',
    ],
  });
});
