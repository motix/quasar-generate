import { defineInstall } from '../index.js';

export default defineInstall(function (api) {
  api.renderTemplate('dist', {
    prompts: api.prompts,
  });
});
