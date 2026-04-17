import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/Expense', 'src/composables/reports/expense', 'src/pages/expenses'],
    removeIfEmpty: [
      'src/composables/reports',
      'src/models/reports',
      'src/stores/reports',
      'src/utils/reports',
    ],
  });
});
