import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/pages/project-transactions'],
    removeIfEmpty: ['src/services/finance'],
  });
});
