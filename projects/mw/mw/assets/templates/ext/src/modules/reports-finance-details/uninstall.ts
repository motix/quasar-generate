import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/FinanceDetails',
      'src/composables/reports/financeDetails',
      'src/pages/finance-details',
    ],
    removeIfEmpty: [
      'src/composables/reports',
      'src/models/reports',
      'src/services/reports',
      'src/stores/reports',
    ],
  });
});
