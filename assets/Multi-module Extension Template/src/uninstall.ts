import type { UninstallDefinition } from './lib/extension-wrappers.js'

import { reduceJsonFile } from './lib/json-helpers.js'
import { getPackageName } from './lib/package-name.js'
import getModules, { defineUninstall } from './modules/index.js'

export default defineUninstall(async function (api) {
  const modules = await getModules<UninstallDefinition>(api.appDir, 'uninstall')

  for (const module of modules) {
    await module(api)
  }

  const packageName = getPackageName()

  await reduceJsonFile(api, 'package.json', [
    `scripts.u-${packageName}`,
    `scripts.r-${packageName}`,
  ])
})
