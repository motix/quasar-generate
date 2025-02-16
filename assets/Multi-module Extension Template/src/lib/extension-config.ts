import { getPackageName } from './package-name.js'

export default async function (appDir: string) {
  let config: {
    hasModule: (name: string) => boolean
    hasPrompts: (name: string) => boolean
    prompts: (name: string) => Record<string, unknown>
    moduleIndex: (name: string) => number
    [key: string]:
      | ((name: string) => boolean)
      | ((name: string) => Record<string, unknown> | undefined)
      | ((name: string) => number)
      | boolean
      | { prompts: Record<string, unknown> }
      | undefined
  } = {
    hasModule: (name) => !!config[name],
    hasPrompts: (name) => !!config[name]?.['prompts'],
    prompts: (name) => config[name]['prompts'],
    moduleIndex: (name) => moduleNames.indexOf(name),
  }

  let moduleNames: string[] = []

  try {
    const packageName = getPackageName().replace(/-/g, '')
    const configData = (await import(`${appDir}/.${packageName}rc.js`)).default

    moduleNames = Object.getOwnPropertyNames(configData)
    config = {
      ...configData,
      ...config,
    }
  } catch {
    // .[packageName]rc.js might not exist in appDir
  }

  return config
}
