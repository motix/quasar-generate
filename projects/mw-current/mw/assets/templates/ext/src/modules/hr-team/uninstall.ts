import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/Member', 'src/pages/team'],
    removeIfEmpty: ['src/models/hr/mapper', 'src/models/hr', 'src/stores/hr'],
  });
});
