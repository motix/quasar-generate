import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/ExpenseGroup', 'src/pages/expense-groups'],
    removeIfEmpty: [
      'src/composables/finance/shared',
      'src/composables/finance',
      'src/models/finance/mapper',
      'src/models/finance',
      'src/stores/finance',
    ],
  });
});
