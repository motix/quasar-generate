import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/SalesContract',
      'src/composables/finance/sales-contract',
      'src/pages/sales-contract',
      'src/utils/finance/SalesContract',
    ],
    removeIfEmpty: [
      'src/composables/finance',
      'src/models/finance/mapper',
      'src/models/finance',
      'src/pages/sales-contracts',
      'src/stores/finance',
      'src/utils/finance',
    ],
  });
});
