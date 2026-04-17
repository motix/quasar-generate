import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/Expense',
      'src/composables/finance/expense',
      'src/pages/general-expense-transactions',
      'src/pages/general-expenses',
      'src/utils/finance/Expense',
    ],
    removeIfEmpty: [
      'src/composables/finance',
      'src/models/finance/mapper',
      'src/models/finance',
      'src/services/finance',
      'src/stores/finance',
      'src/utils/finance',
    ],
  });
});
