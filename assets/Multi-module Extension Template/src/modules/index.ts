import type {
  IndexDefinition,
  InstallDefinition,
  PromptsDefinition,
  UninstallDefinition,
} from '../lib/extension-wrappers.js'

import fs from 'fs'

import getExtensionConfig from '../lib/extension-config.js'

export default async function <
  T extends PromptsDefinition | IndexDefinition | InstallDefinition | UninstallDefinition,
>(
  appDir: string,
  script: T extends PromptsDefinition
    ? 'prompts'
    : T extends IndexDefinition
      ? 'index'
      : T extends InstallDefinition
        ? 'install'
        : T extends UninstallDefinition
          ? 'uninstall'
          : never,
) {
  const config = await getExtensionConfig(appDir)

  let modules: T[] = []
  const files = fs.readdirSync(import.meta.dirname)

  for (const file of files) {
    if (file === 'index.js' || !config.hasModule(file)) continue

    try {
      const module: T = (await import(`./${file}/${script}.js`)).default

      Object.defineProperty(module, 'name', { value: file })
      modules[config.moduleIndex(file)] = module
    } catch {
      // prompts, index, install or uninstall might be missing in a module
    }
  }

  modules = modules.filter((value) => !!value)

  if (script === 'uninstall') {
    modules.reverse()
  }

  return modules
}

export {
  defineIndex,
  defineInstall,
  definePrompts,
  defineUninstall,
} from '../lib/extension-wrappers.js'
