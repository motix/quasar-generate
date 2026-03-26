import type { UninstallAPI } from '@quasar/app-vite';

import type { UninstallDefinition } from './lib/extension-wrappers.js';
import { reduceJsonFile } from './lib/json-helpers.js';
import { getPackageName } from './lib/package-name.js';
import getModules from './modules/index.js';

export default async function (api: UninstallAPI) {
  const modules = await getModules<UninstallDefinition>(api.appDir, 'uninstall');

  const packageName = getPackageName();

  console.log(` \x1b[32m${packageName} •\x1b[0m`, 'Uninstalling', modules.length, 'modules...');

  for (const module of modules) {
    console.log(
      ` \x1b[32m${packageName} •\x1b[0m`,
      'Uninstalling module',
      `\x1b[32m${module.name}\x1b[0m...`,
    );
    await module(api);
  }

  reduceJsonFile(api, 'package.json', [`scripts.u-${packageName}`, `scripts.r-${packageName}`]);
}
