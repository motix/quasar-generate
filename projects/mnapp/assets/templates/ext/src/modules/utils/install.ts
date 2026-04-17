import { defineInstall } from '../index.js';
import packagesVersion from './packages-version.js';

export default defineInstall(function (api) {
  api.renderTemplate();

  if (!api.hasModule('firebase')) {
    api.extendPackageJson({
      dependencies: { firebase: packagesVersion.firebase },
    });
  }
});
