import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/shared/crud-pages', 'src/composables/crud-pages'],
  });

  if (api.deployToDev()) {
    api.removeTemplateTree('dev', {
      knownPaths: [
        'src/components/crud-pages',
        'src/models/crud-pages',
        'src/pages/crud-pages',
        'src/stores/crud-pages',
      ],
    });
  }
});
