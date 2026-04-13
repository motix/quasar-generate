import { defineInstall } from '../index.js';
import packagesVersion from './packages-version.js';

export default defineInstall(function (api) {
  api.extendPackageJson({
    dependencies: {
      'vite-plugin-markdown': packagesVersion['vite-plugin-markdown'],
    },
  });

  api.renderTemplate();
});
