import type { InstallAPI } from '@quasar/app-vite';

import type { InstallDefinition } from './lib/extension-wrappers.js';
import { backupFile } from './lib/file-backup.js';
import { reduceJsonFile } from './lib/json-helpers.js';
import { getOrganizationName, getPackageName } from './lib/package-name.js';
import getModules from './modules/index.js';

export default async function (api: InstallAPI) {
  const modules = await getModules<InstallDefinition>(api.appDir, 'install');

  backupFile(api, 'package.json');
  backupFile(api, 'tsconfig.json');

  const packageName = getPackageName();
  const organizationName = getOrganizationName();

  const scripts: Record<string, string> = {};
  scripts[`i-${packageName}`] =
    `quasar ext invoke ${organizationName}/${packageName} && yarn format --log-level warn`;
  scripts[`u-${packageName}`] =
    `quasar ext uninvoke ${organizationName}/${packageName} && yarn format --log-level warn`;
  scripts[`r-${packageName}`] = `yarn u-${packageName} && yarn i-${packageName} && yarn clean`;

  // Remove current i- to keep i-, u- and r- together
  reduceJsonFile(api, 'package.json', [`scripts.i-${packageName}`]);
  api.extendPackageJson({
    scripts,
  });

  console.log(` \x1b[32m${packageName} •\x1b[0m`, 'Installing', modules.length, 'modules...');

  for (const module of modules) {
    console.log(
      ` \x1b[32m${packageName} •\x1b[0m`,
      'Installing module',
      `\x1b[32m${module.name}\x1b[0m...`,
    );
    await module(api);
  }
}
