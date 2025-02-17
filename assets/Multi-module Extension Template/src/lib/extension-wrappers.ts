import type { IndexAPI, InstallAPI, PromptsAPI, UninstallAPI } from '@quasar/app-vite'

import { InstallAPI as InstallAPIClass } from '../../node_modules/@quasar/app-vite/lib/app-extension/api-classes/InstallAPI.js'
import getExtensionConfig from './extension-config.js'
import normalizeModuleName from './normalize-module-name.js'

type ExtendedUninstallAPI = UninstallAPI & Pick<InstallAPI, 'extendJsonFile'>

// See Inquirer.js https://github.com/SBoudrias/Inquirer.js for other features
export type PromptRecord = {
  name: string
  type: 'input' | 'number' | 'confirm'
  message: string
  default: unknown
}

export type PromptsDefinition = (api: PromptsAPI) => PromptRecord[] | Promise<PromptRecord[]>
export type IndexDefinition = (api: IndexAPI) => void | Promise<void>
export type InstallDefinition = (api: InstallAPI) => void | Promise<void>
export type UninstallDefinition = (api: ExtendedUninstallAPI) => void | Promise<void>

export function definePrompts(callback: PromptsDefinition): PromptsDefinition {
  return callback
}

export function defineIndex(callback: IndexDefinition): IndexDefinition {
  return async (api: IndexAPI) => {
    await mergePrompts(callback.name, api)
    return callback(api)
  }
}

export function defineInstall(callback: InstallDefinition): InstallDefinition {
  return async (api: InstallAPI) => {
    await mergePrompts(callback.name, api)
    return callback(api)
  }
}

export function defineUninstall(callback: UninstallDefinition): UninstallDefinition {
  return async (api: UninstallAPI) => {
    await mergePrompts(callback.name, api)
    return callback({
      ...api,
      extendJsonFile: new InstallAPIClass({
        ctx: api.ctx,
        extId: api.extId,
        prompts: api.prompts,
      }).extendJsonFile,
    })
  }
}

async function mergePrompts(callbackName: string, api: IndexAPI | InstallAPI | UninstallAPI) {
  const config = await getExtensionConfig(api.appDir)
  const moduleName = normalizeModuleName(callbackName)

  if (config.hasPrompts(moduleName)) {
    const promptsConfig = config.prompts(moduleName)

    for (const prompt in promptsConfig) {
      if (promptsConfig[prompt] !== undefined && api.prompts[prompt] === undefined) {
        api.prompts[prompt] = promptsConfig[prompt]
      }
    }
  }
}
