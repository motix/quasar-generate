import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/Invoice',
      'src/composables/finance/invoice',
      'src/pages/general-invoice-transactions',
      'src/pages/general-invoices',
      'src/utils/finance/Invoice',
    ],
    removeIfEmpty: [
      'src/composables/finance',
      'src/models/finance/mapper',
      'src/models/finance',
      'src/services/finance',
      'src/services/seed',
      'src/stores/finance',
      'src/utils/finance',
    ],
  });
});
