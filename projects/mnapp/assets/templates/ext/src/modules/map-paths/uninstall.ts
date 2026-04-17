import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  // The template is actually empty. Use this to remove empty paths only.
  api.removeTemplateTree('dist', {
    removeIfEmpty: [
      'src/utils',
      'src/models',
      'src/api',
      'src/services',
      'src/composables',
      'src/types',
    ],
  });
});
