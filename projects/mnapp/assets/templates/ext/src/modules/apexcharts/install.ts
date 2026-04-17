import { defineInstall } from '../index.js';
import packagesVersion from './packages-version.js';

export default defineInstall(function (api) {
  const packages: (keyof typeof packagesVersion)[] = ['apexcharts', 'vue3-apexcharts'];
  api.extendPackageJson({
    dependencies: Object.fromEntries(packages.map((item) => [item, packagesVersion[item]])),
  });

  api.renderTemplate();
});
