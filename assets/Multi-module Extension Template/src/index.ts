import type { IndexAPI } from '@quasar/app-vite';

import type { IndexDefinition } from './lib/extension-wrappers.js';
import { getPackageName } from './lib/package-name.js';
import getModules from './modules/index.js';

export default async function (api: IndexAPI) {
  const modules = await getModules<IndexDefinition>(api.appDir, 'index');

  const packageName = getPackageName();

  console.log(` \x1b[32m${packageName} •\x1b[0m`, 'Running', modules.length, 'modules...');

  for (const module of modules) {
    console.log(
      ` \x1b[32m${packageName} •\x1b[0m`,
      'Running module',
      `\x1b[32m${module.name}\x1b[0m...`,
    );
    await module(api);
  }
}
