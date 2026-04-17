import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/Payable', 'src/composables/reports/payable', 'src/pages/payable'],
    removeIfEmpty: ['src/composables/reports', 'src/models/reports', 'src/stores/reports'],
  });
});
