import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/components/shared/expandable-card',
      'src/components/shared/transition',
      'src/components/shared/validation',
      'src/types/shared-components',
    ],
    removeIfEmpty: ['src/components/shared'],
  });

  if (api.deployToDev()) {
    api.removeTemplateTree('dev');
  }
});
