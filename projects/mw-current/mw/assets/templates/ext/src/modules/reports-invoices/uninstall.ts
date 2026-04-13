import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/Invoice', 'src/composables/reports/invoice', 'src/pages/invoices'],
    removeIfEmpty: [
      'src/composables/reports',
      'src/models/reports',
      'src/stores/reports',
      'src/utils/reports',
    ],
  });
});
