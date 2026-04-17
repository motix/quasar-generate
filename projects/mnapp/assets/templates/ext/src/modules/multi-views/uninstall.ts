import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree();

  if (api.deployToDev()) {
    api.removeTemplateTree('dev');
  }
});
