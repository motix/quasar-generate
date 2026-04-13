import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/Transaction',
      'src/composables/finance/transaction',
      'src/pages/general-transactions',
      'src/utils/finance/Transaction',
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
