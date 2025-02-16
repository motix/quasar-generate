import type { IndexDefinition } from './lib/extension-wrappers.js'

import getModules, { defineIndex } from './modules/index.js'

export default defineIndex(async function (api) {
  const modules = await getModules<IndexDefinition>(api.appDir, 'index')

  for (const module of modules) {
    await module(api)
  }
})
