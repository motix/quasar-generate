import { getPackageName } from './package-name.js'

export default async function (appDir: string) {
  let modules: {
    [key in string]: boolean | { prompts?: Record<string, unknown> }
  } = {}
  let moduleNames: string[] = []

  const config: {
    hasModule: (name: string) => boolean
    hasPrompts: (name: string) => boolean
    prompts: (name: string) => Record<string, unknown>
    moduleIndex: (name: string) => number
  } = {
    hasModule: (name) => !!modules[name],
    hasPrompts: (name) => (typeof modules[name] === 'object' ? !!modules[name].prompts : false),
    prompts: (name) =>
      typeof modules[name] === 'object' && !!modules[name].prompts
        ? modules[name].prompts
        : (() => {
            throw new Error(`Module '${name}' does not exist or it doesn't have prompts.`)
          })(),
    moduleIndex: (name) => moduleNames.indexOf(name),
  }

  try {
    const packageName = getPackageName().replace(/-/g, '')

    modules = (await import(`${appDir}/.${packageName}rc.js`)).default
    moduleNames = Object.getOwnPropertyNames(modules)
  } catch {
    // .[packageName]rc.js might not exist in appDir
  }

  return config
}
