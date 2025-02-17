import type { InstallDefinition } from './lib/extension-wrappers.js'

import { backupFile } from './lib/file-backup.js'
import { reduceJsonFile } from './lib/json-helpers.js'
import { getOrganizationName, getPackageName } from './lib/package-name.js'
import getModules, { defineInstall } from './modules/index.js'

export default defineInstall(async function (api) {
  const modules = await getModules<InstallDefinition>(api.appDir, 'install')

  backupFile(api, 'package.json')
  backupFile(api, 'tsconfig.json')

  const packageName = getPackageName()
  const organizationName = getOrganizationName()

  const scripts = {}
  scripts[`i-${packageName}`] = `quasar ext invoke ${organizationName}/${packageName}`
  scripts[`u-${packageName}`] = `quasar ext uninvoke ${organizationName}/${packageName}`
  scripts[`r-${packageName}`] = `yarn u-${packageName} && yarn i-${packageName}`

  // Remove current i- to keep i-, u- and r- together
  await reduceJsonFile(api, 'package.json', [`scripts.i-${packageName}`])
  api.extendPackageJson({
    scripts,
  })
  // TODO: delete require.cache[api.resolve.app('package.json')]

  for (const module of modules) {
    await module(api)
  }
})
