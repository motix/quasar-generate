import type { IndexDefinition } from './lib/extension-wrappers.js'
import type { IndexAPI } from '@quasar/app-vite'

import getModules from './modules/index.js'

export default async function (api: IndexAPI) {
  const modules = await getModules<IndexDefinition>(api.appDir, 'index')

  console.log(' \x1b[32mmnapp • \x1b[0mRunning', modules.length, 'modules...')

  for (const module of modules) {
    console.log(' \x1b[32mmnapp • \x1b[0mRunning module', `\x1b[32m${module.name}\x1b[0m...`)
    await module(api)
  }
}
