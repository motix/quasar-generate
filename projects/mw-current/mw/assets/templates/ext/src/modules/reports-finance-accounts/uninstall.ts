import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/FinanceAccount',
      'src/composables/reports/financeAccount',
      'src/pages/finance-accounts',
    ],
    removeIfEmpty: [
      'src/composables/reports',
      'src/models/reports',
      'src/services/reports',
      'src/stores/reports',
      'src/utils/reports',
    ],
  });
});
