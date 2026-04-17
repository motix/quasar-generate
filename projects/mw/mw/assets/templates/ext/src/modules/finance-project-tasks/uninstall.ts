import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/pages/project-tasks'],
    removeIfEmpty: ['src/models/finance/mapper', 'src/models/finance', 'src/stores/finance'],
  });
});
