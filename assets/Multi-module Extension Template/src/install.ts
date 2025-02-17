import type { InstallDefinition } from './lib/extension-wrappers.js'
import type { InstallAPI } from '@quasar/app-vite'

import { backupFile } from './lib/file-backup.js'
import { reduceJsonFile } from './lib/json-helpers.js'
import { getOrganizationName, getPackageName } from './lib/package-name.js'
import getModules from './modules/index.js'

export default async function (api: InstallAPI) {
  const modules = await getModules<InstallDefinition>(api.appDir, 'install')

  backupFile(api, 'package.json')
  backupFile(api, 'tsconfig.json')

  const packageName = getPackageName()
  const organizationName = getOrganizationName()

  const scripts = {}
  scripts[`i-${packageName}`] = `quasar ext invoke ${organizationName}/${packageName}`
  scripts[`u-${packageName}`] = `quasar ext uninvoke ${organizationName}/${packageName}`
  scripts[`r-${packageName}`] = `yarn u-${packageName} && yarn i-${packageName} && yarn clean`

  // Remove current i- to keep i-, u- and r- together
  reduceJsonFile(api, 'package.json', [`scripts.i-${packageName}`])
  api.extendPackageJson({
    scripts,
  })

  for (const module of modules) {
    await module(api)
  }
}
