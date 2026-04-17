import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/pages/project-tasks'],
    removeIfEmpty: [
      'src/models/production/mapper',
      'src/models/production',
      'src/stores/production',
    ],
  });
});
