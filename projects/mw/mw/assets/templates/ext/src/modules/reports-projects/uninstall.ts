import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/Project', 'src/composables/reports/project', 'src/pages/projects'],
    removeIfEmpty: ['src/composables/reports', 'src/models/reports', 'src/stores/reports'],
  });
});
