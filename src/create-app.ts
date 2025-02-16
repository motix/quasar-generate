import type { CreateAppConfig } from './types'

import {
  ACCEPT_DEFAULT,
  cliGhostwriter,
  DOWN_KEY,
  WHITESPACE_KEY,
} from '@dreamonkey/cli-ghostwriter'

const project = process.argv[2]
const config = (await import(`../projects/${project}.js`)).default as CreateAppConfig

const answersMap: Record<string, string | undefined> = {
  'What would you like to build?': ACCEPT_DEFAULT, // App with Quasar CLI
  'Project folder': `output/${config.projectFolder}`,
  'Pick script type': `${DOWN_KEY}`, // Typescript
  'Pick Quasar App CLI variant': ACCEPT_DEFAULT, // Quasar App CLI with Vite
  'Package name': config.packageName,
  'Project product name': config.productName,
  'Project description': config.productDescription,
  Author: config.author,
  'Pick a Vue component style': ACCEPT_DEFAULT, // Composition API with <script setup>
  'Pick your CSS preprocessor': ACCEPT_DEFAULT, // Sass with SCSS syntax
  'Check the features needed for your project': `${DOWN_KEY}${WHITESPACE_KEY}`, // Linting, Pinia
  'Add Prettier for code formatting?': ACCEPT_DEFAULT, // Y
  'Install project dependencies?': `${DOWN_KEY}`, // No
}

await cliGhostwriter({
  command: 'yarn create quasar',
  answersMap,
  endingMarker: 'Enjoy! - Quasar Team',
})
