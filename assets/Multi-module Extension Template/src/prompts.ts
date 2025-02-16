import type { PromptRecord, PromptsDefinition } from './lib/extension-wrappers.js'

import getExtensionConfig from './lib/extension-config.js'
import normalizeModuleName from './lib/normalize-module-name.js'
import getModules, { definePrompts } from './modules/index.js'

export default definePrompts(async function (api) {
  const modules = await getModules<PromptsDefinition>(api.appDir, 'prompts')
  const config = await getExtensionConfig(api.appDir)
  let prompts: PromptRecord[] = []

  for (const module of modules) {
    const modulePrompts = await module(api)
    const moduleName = normalizeModuleName(module.name)

    if (config.hasPrompts(moduleName)) {
      const promptsConfig = config.prompts(moduleName)

      for (const modulePrompt of modulePrompts) {
        if (promptsConfig[modulePrompt.name] !== undefined) {
          modulePrompt.default = promptsConfig[modulePrompt.name]
        }
      }
    }

    prompts = [...prompts, ...modulePrompts]
  }

  return prompts
})
