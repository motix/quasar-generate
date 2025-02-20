import type { IndexAPI, InstallAPI, PromptsAPI, UninstallAPI } from '@quasar/app-vite'

// @ts-expect-error Importing from a specific path in node_modules
import { InstallAPI as InstallAPIClass } from '../../node_modules/@quasar/app-vite/lib/app-extension/api-classes/InstallAPI.js'
// @ts-expect-error Importing from a specific path in node_modules
import { getCallerPath } from '../../node_modules/@quasar/app-vite/lib/utils/get-caller-path.js'
import getExtensionConfig from './extension-config.js'
import removeTree from './remove-tree.js'

type Config = Awaited<ReturnType<typeof getExtensionConfig>>

type ExtendedApi = Pick<Config, 'hasModule'> & {
  deployToDev: () => boolean
}

type ExtendedIndexAPI = IndexAPI & ExtendedApi

type ExtendedInstallAPI = InstallAPI &
  ExtendedApi & {
    renderTemplate: (name?: string, scope?: object) => void
  }

type ExtendedUninstallAPI = UninstallAPI &
  ExtendedApi &
  Pick<InstallAPI, 'extendJsonFile'> & {
    removeTemplateTree: (
      name?: string,
      options?: {
        knownPaths?: string[]
        excludePaths?: string[]
        removeIfEmpty?: string[]
      },
    ) => void
  }

// See Inquirer.js https://github.com/SBoudrias/Inquirer.js for other features
export type PromptRecord = {
  name: string
  type: 'input' | 'number' | 'confirm'
  message: string
  default?: unknown
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
  const callerPath: string = getCallerPath()
  const moduleName = callerPath.substring(callerPath.lastIndexOf('/') + 1)

  return async (api) => {
    await extendApi(moduleName, api)
    return callback(api as ExtendedIndexAPI)
  }
}

export function defineInstall(callback: ExtendedInstallDefinition): InstallDefinition {
  const callerPath: string = getCallerPath()
  const moduleName = callerPath.substring(callerPath.lastIndexOf('/') + 1)

  return async (api) => {
    await extendApi(moduleName, api)

    Object.assign(api, {
      renderTemplate(name: string = 'dist', scope?: object) {
        api.render(`../../templates/modules/${moduleName}/${name}`, scope)
      },
    })

    return callback(api as ExtendedInstallAPI)
  }
}

export function defineUninstall(callback: ExtendedUninstallDefinition): UninstallDefinition {
  const callerPath: string = getCallerPath()
  const moduleName = callerPath.substring(callerPath.lastIndexOf('/') + 1)

  return async (api) => {
    await extendApi(moduleName, api)

    const installApi: InstallAPI = new InstallAPIClass({
      ctx: api.ctx,
      extId: api.extId,
      prompts: api.prompts,
    })

    Object.assign(api, {
      extendJsonFile: (file: string, newData: object) => {
        installApi.extendJsonFile(file, newData)
      },
      removeTemplateTree: (
        name: string = 'dist',
        options?: {
          knownPaths?: string[]
          excludePaths?: string[]
          removeIfEmpty?: string[]
        },
      ) => {
        removeTree(api, `../../templates/modules/${moduleName}/${name}`, options)
      },
    })

    return callback(api as ExtendedUninstallAPI)
  }
}

async function extendApi(moduleName: string, api: IndexAPI | InstallAPI | UninstallAPI) {
  await mergePrompts(moduleName, api)

  const config = await getExtensionConfig(api.appDir)
  const extendedFunctions: ExtendedApi = {
    hasModule: (name: string) => config.hasModule(name),
    deployToDev: () =>
      api.appDir.endsWith('/dev') || api.appDir.endsWith('\\dev') || api.appDir.endsWith('-dev'),
  }

  Object.assign(api, extendedFunctions)
}

async function mergePrompts(moduleName: string, api: IndexAPI | InstallAPI | UninstallAPI) {
  const config = await getExtensionConfig(api.appDir)

  if (config.hasPrompts(moduleName)) {
    const promptsConfig = config.prompts(moduleName)

    for (const prompt in promptsConfig) {
      if (promptsConfig[prompt] !== undefined && api.prompts[prompt] === undefined) {
        api.prompts[prompt] = promptsConfig[prompt]
      }
    }
  }
}
