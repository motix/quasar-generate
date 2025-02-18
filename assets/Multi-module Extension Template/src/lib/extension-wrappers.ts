import type { IndexAPI, InstallAPI, PromptsAPI, UninstallAPI } from '@quasar/app-vite'

// @ts-expect-error Importing from a specific path in node_modules
import { InstallAPI as InstallAPIClass } from '../../node_modules/@quasar/app-vite/lib/app-extension/api-classes/InstallAPI.js'
import getExtensionConfig from './extension-config.js'
import normalizeModuleName from './normalize-module-name.js'

type Config = Awaited<ReturnType<typeof getExtensionConfig>>

type ExtendedIndexAPI = IndexAPI & Pick<Config, 'hasModule'>

type ExtendedInstallAPI = InstallAPI & Pick<Config, 'hasModule'>

type ExtendedUninstallAPI = UninstallAPI &
  Pick<InstallAPI, 'extendJsonFile'> &
  Pick<Config, 'hasModule'>

// See Inquirer.js https://github.com/SBoudrias/Inquirer.js for other features
export type PromptRecord = {
  name: string
  type: 'input' | 'number' | 'confirm'
  message: string
  default: unknown
}

export type PromptsDefinition = (api: PromptsAPI) => PromptRecord[] | Promise<PromptRecord[]>
export type IndexDefinition = (api: IndexAPI) => void | Promise<void>
export type ExtendedIndexDefinition = (api: ExtendedIndexAPI) => void | Promise<void>
export type InstallDefinition = (api: InstallAPI) => void | Promise<void>
export type ExtendedInstallDefinition = (api: ExtendedInstallAPI) => void | Promise<void>
export type UninstallDefinition = (api: UninstallAPI) => void | Promise<void>
export type ExtendedUninstallDefinition = (api: ExtendedUninstallAPI) => void | Promise<void>

export function definePrompts(callback: PromptsDefinition): PromptsDefinition {
  return callback
}

export function defineIndex(callback: ExtendedIndexDefinition): IndexDefinition {
  return async (api) => {
    await extendApi(callback.name, api)
    return callback(api as ExtendedIndexAPI)
  }
}

export function defineInstall(callback: ExtendedInstallDefinition): InstallDefinition {
  return async (api) => {
    await extendApi(callback.name, api)
    return callback(api as ExtendedInstallAPI)
  }
}

export function defineUninstall(callback: ExtendedUninstallDefinition): UninstallDefinition {
  return async (api) => {
    await extendApi(callback.name, api)

    const installApi: InstallAPI = new InstallAPIClass({
      ctx: api.ctx,
      extId: api.extId,
      prompts: api.prompts,
    })

    Object.assign(api, {
      extendJsonFile: (file: string, newData: object) => {
        installApi.extendJsonFile(file, newData)
      },
    })

    return callback(api as ExtendedUninstallAPI)
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

async function extendApi(callbackName: string, api: IndexAPI | InstallAPI | UninstallAPI) {
  await mergePrompts(callbackName, api)

  const config = await getExtensionConfig(api.appDir)

  Object.assign(api, {
    hasModule: (name: string) => config.hasModule(name),
  })
}
