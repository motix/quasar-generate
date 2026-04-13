import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/Payroll',
      'src/composables/hr/Payroll',
      'src/pages/payrolls',
      'src/utils/hr/payroll',
    ],
    removeIfEmpty: [
      'src/composables/hr',
      'src/models/hr/mapper',
      'src/models/hr',
      'src/services/hr',
      'src/services/seed',
      'src/stores/hr',
      'src/utils/hr',
    ],
  });
});
