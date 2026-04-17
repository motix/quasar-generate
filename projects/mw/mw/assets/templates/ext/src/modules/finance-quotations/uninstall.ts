import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/Quotation',
      'src/composables/finance/quotation',
      'src/pages/quotations',
      'src/utils/finance/Quotation',
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
