import { defineInstall } from '../index.js';
import packagesVersion from './packages-version.js';

export default defineInstall(function (api) {
  const packages: (keyof typeof packagesVersion)[] = ['exceljs', 'file-saver'];
  api.extendPackageJson({
    dependencies: Object.fromEntries(packages.map((item) => [item, packagesVersion[item]])),
    devDependencies: {
      '@types/file-saver': packagesVersion['@types/file-saver'],
    },
  });

  api.renderTemplate();
});
