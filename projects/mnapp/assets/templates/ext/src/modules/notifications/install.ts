import { defineInstall } from '../index.js';

export default defineInstall(function (api) {
  api.renderTemplate();

  if (api.deployToDev()) {
    api.renderTemplate('dev');
  }
});
