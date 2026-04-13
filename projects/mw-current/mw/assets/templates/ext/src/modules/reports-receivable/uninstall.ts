import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/Receivable',
      'src/composables/reports/receivable',
      'src/pages/receivable',
    ],
    removeIfEmpty: ['src/composables/reports', 'src/models/reports', 'src/stores/reports'],
  });
});
