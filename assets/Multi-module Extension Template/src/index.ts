import type { IndexDefinition } from './lib/extension-wrappers.js'
import type { IndexAPI } from '@quasar/app-vite'

import getModules from './modules/index.js'

export default async function (api: IndexAPI) {
  const modules = await getModules<IndexDefinition>(api.appDir, 'index')

  for (const module of modules) {
    await module(api)
  }
}
