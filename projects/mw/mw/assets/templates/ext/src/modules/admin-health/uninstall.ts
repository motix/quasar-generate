import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/Health', 'src/models/health'],
    removeIfEmpty: ['src/services/admin'],
  });
});
