import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/Member',
      'src/components/UserAccount',
      'src/models/membership',
      'src/pages/accounts',
      'src/pages/team',
      'src/stores/membership',
    ],
    removeIfEmpty: ['src/services/admin', 'src/services/seed'],
  });
});
