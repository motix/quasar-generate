import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import { ACCEPT_DEFAULT, cliGhostwriter, DOWN_KEY } from '@dreamonkey/cli-ghostwriter'

import setupFormatLint from './lib/format-lint.js'
import { extendJsonFile, reduceJsonFile } from './lib/json-helpers.js'
import type { CreateExtensionConfig } from './types'

const globalAssets = './assets'
const project = process.argv[2]
const autoLaunch = process.argv[3]
const config = (await import(`../projects/${project}.js`)).default as CreateExtensionConfig
const extensionRoot = `./output/${config.projectFolder}`
const templatesRoot = `${extensionRoot}/templates`
const extensionPackageJsonFilePath = path.resolve(`${extensionRoot}/package.json`)
const templatesPackageJsonFilePath = path.resolve(`${templatesRoot}/package.json`)

// Turning on/off functions
const f = false

f || (await createExtensionQuasarProject())
f || (await createTemplatesQuasarProject())

if (config.hasDev) {
  f || createDevProject()
}

f || cleanTemplatesProject()
f || templatesProjectLintingAndFormatting()
f || finishTemplatesProject()
f || cleanExtensionProject()
f || (await extensionProjectLintingAndFormatting())
f || finishExtensionProject()

if (autoLaunch === '-l') {
  f || launchExtensionProject()
}

async function createExtensionQuasarProject() {
  // Create Quasar project for the extension.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    `Creating Quasar project for \x1b[47m${config.extensionId}\x1b[0m...`,
  )

  const answersMap: Record<string, string | undefined> = {
    'What would you like to build?': `${DOWN_KEY}`, // AppExtension (AE) for Quasar CLI
    'Project folder': extensionRoot,
    'Will you use an organization to publish it?': 'y',
    'Organization name': config.organizationName,
    'Quasar App Extension ext-id': config.extensionId,
    'Pick AE code format': ACCEPT_DEFAULT, // ESM
    'Project description': config.projectDescription,
    Author: config.author,
    'License type': ACCEPT_DEFAULT,
    'Pick the needed scripts': 'a',
  }

  await cliGhostwriter({
    command: 'yarn create quasar',
    answersMap: answersMap,
    endingMarker: 'Enjoy! - Quasar Team',
  })
}

async function createTemplatesQuasarProject() {
  // Create Quasar project for `templates`.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    'Creating Quasar project for \x1b[47mtemplates\x1b[0m...',
  )

  const answersMap: Record<string, string | undefined> = {
    'What would you like to build?': ACCEPT_DEFAULT, // App with Quasar CLI
    'Project folder': templatesRoot,
    'Pick script type': `${DOWN_KEY}`, // Typescript
    'Pick Quasar App CLI variant': ACCEPT_DEFAULT, // Quasar App CLI with Vite
    'Package name': `${config.extensionId}-templates`,
    'Project product name': `${config.extensionId} Templates`,
    'Project description': `Templates for ${config.extensionId}`,
    Author: config.author,
    'Pick a Vue component style': ACCEPT_DEFAULT, // Composition API with <script setup>
    'Pick your CSS preprocessor': ACCEPT_DEFAULT, // Sass with SCSS syntax
    'Check the features needed for your project': ACCEPT_DEFAULT, // Linting
    'Add Prettier for code formatting?': ACCEPT_DEFAULT, // Y
    'Install project dependencies?': `${DOWN_KEY}`, // No
  }

  await cliGhostwriter({
    command: 'yarn create quasar',
    answersMap: answersMap,
    endingMarker: 'Enjoy! - Quasar Team',
  })
}

function createDevProject() {
  if (!config.hasDev) {
    return
  }

  execSync(`yarn create-app ${config.hasDev.project}`, {
    stdio: 'inherit',
  })

  fs.renameSync('./output/dev', `${extensionRoot}/dev`)
}

function cleanTemplatesProject() {
  // Delete `templates/public`, `templates/src`,
  // `templates/postcss.config.js`, `templates/README.md`.

  fs.rmSync(`${templatesRoot}/public`, { recursive: true })
  fs.rmSync(`${templatesRoot}/src`, { recursive: true })
  fs.rmSync(`${templatesRoot}/postcss.config.js`)
  fs.rmSync(`${templatesRoot}/README.md`)

  // Modify `templates/index.html` content.

  fs.writeFileSync(
    `${templatesRoot}/index.html`,
    `<!-- Supports quasar prepare -->

<!-- quasar:entry-point -->
`,
    { encoding: 'utf-8' },
  )

  // Modify `templates/quasar.config.ts` content.

  fs.writeFileSync(
    `${templatesRoot}/quasar.config.ts`,
    `// Supports quasar prepare

import { defineConfig } from '#q-app/wrappers'

export default defineConfig((/* ctx */) => {
  return {
    build: {
      typescript: {
        strict: true,
        vueShim: false,
      },
    },
  }
})
`,
    { encoding: 'utf-8' },
  )

  // Add `src` and sub folders from global `assets`.

  fs.cpSync(
    `${globalAssets}/Multi-module Extension Template/templates`,
    `${extensionRoot}/templates`,
    {
      recursive: true,
    },
  )

  fs.mkdirSync(`${templatesRoot}/src/layouts`, { recursive: true })
  fs.mkdirSync(`${templatesRoot}/src/pages`)

  // Add `MainLayout.vue`.

  fs.writeFileSync(
    `${templatesRoot}/src/layouts/MainLayout.vue`,
    `<template>
  <div></div>
</template>

<script setup lang="ts">
// Supports dev templates
</script>
`,
    { encoding: 'utf-8' },
  )

  // Add `IndexPage.vue`.

  fs.writeFileSync(
    `${templatesRoot}/src/pages/IndexPage.vue`,
    `<template>
  <div></div>
</template>

<script setup lang="ts">
// Supports dev templates
</script>
`,
    { encoding: 'utf-8' },
  )

  // Modify `tsconfig.json` to use `tsconfig-paths.json`.

  fs.writeFileSync(
    `${templatesRoot}/tsconfig.json`,
    `{
  "extends": "./tsconfig-paths.json",
  "include": ["../dev/**/*.d.ts", "./.quasar/**/*.d.ts", "./**/*"]
}
`,
  )

  // Remove `dev` and `build` scripts.

  reduceJsonFile(templatesPackageJsonFilePath, ['scripts.dev', 'scripts.build'])

  // Uninstall packages: `@quasar/extras`, `vite-plugin-checker`,
  // `@types/node`, `autoprefixer` and upgrade all remaining packages to latest.

  reduceJsonFile(templatesPackageJsonFilePath, [
    'dependencies.@quasar/extras',
    'devDependencies.vite-plugin-checker',
    'devDependencies.autoprefixer',
  ])

  extendJsonFile(templatesPackageJsonFilePath, [
    { path: 'dependencies.quasar', value: '^2.17.7' },
    { path: 'dependencies.vue', value: '^3.5.13' },
    { path: 'dependencies.vue-router', value: '^4.5.0' },
    { path: 'devDependencies.@eslint/js', value: '^9.20.0' },
    { path: 'devDependencies.eslint', value: '^9.20.1' },
    { path: 'devDependencies.eslint-plugin-vue', value: '^9.32.0' },
    { path: 'devDependencies.globals', value: '^15.15.0' },
    { path: 'devDependencies.vue-tsc', value: '^2.2.2' },
    { path: 'devDependencies.@vue/eslint-config-typescript', value: '^14.4.0' },
    { path: 'devDependencies.@vue/eslint-config-prettier', value: '^10.2.0' },
    { path: 'devDependencies.prettier', value: '^3.5.1' },
    { path: 'devDependencies.@types/node', value: '^20.5.9' },
    { path: 'devDependencies.@quasar/app-vite', value: '^2.1.0' },
    { path: 'devDependencies.typescript', value: '^5.7.3' },
  ])

  // Create folder `templates/modules` and add default file.

  fs.mkdirSync(`${templatesRoot}/modules`, { recursive: true })

  fs.writeFileSync(
    `${templatesRoot}/modules/index.ts`,
    `// Dump file to prevent \`lint\` script from rasing error.
// Remove this file if any code was added.
`,
    { encoding: 'utf-8' },
  )
}

function templatesProjectLintingAndFormatting() {
  setupFormatLint(templatesRoot)

  // Modify `templates/package.json` `lint` and `clean` script,
  // changing `src*` and `src` to `modules`.

  extendJsonFile(templatesPackageJsonFilePath, [
    {
      path: 'scripts.lint',
      value: 'eslint -c ./eslint.config.js "./modules/**/*.{ts,js,cjs,mjs,vue}"',
    },
    {
      path: 'scripts.clean',
      value: 'yarn format-imports modules && yarn format --log-level warn && yarn lint --fix',
    },
  ])
}

function finishTemplatesProject() {
  // Add build script.

  extendJsonFile(templatesPackageJsonFilePath, [
    {
      path: 'scripts.tsc',
      value: 'yarn vue-tsc --noEmit --skipLibCheck',
    },
  ])

  // Install templates packages and clean code.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    'Installing \x1b[47mtemplates\x1b[0m packages and clean code...',
  )

  fixTemplatesQuasarAppVite()
  execSync(`cd ${templatesRoot} && yarn && node ./buildPaths.js && yarn clean`, {
    stdio: 'inherit',
  })
}

function cleanExtensionProject() {
  // Delete `src` folder.

  fs.rmSync(`${extensionRoot}/src`, { recursive: true })

  // Add `lodash-es` and `@types/lodash-es` to `package.json`.

  extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'devDependencies.lodash-es',
      value: '^4.17.21',
    },
    {
      path: 'devDependencies.@types/lodash-es',
      value: '^4.17.12',
    },
  ])

  // Add `src` from global `assets`.

  fs.cpSync(`${globalAssets}/Multi-module Extension Template/src`, `${extensionRoot}/src`, {
    recursive: true,
  })
}

async function extensionProjectLintingAndFormatting() {
  // Copy `.vscode`, `.editorconfig`, `.prettierrc.json`, `eslint.config.js`,
  // `import-sorter.json` from `templates` to root.

  fs.cpSync(`${templatesRoot}/.vscode`, `${extensionRoot}/.vscode`, { recursive: true })
  fs.copyFileSync(`${templatesRoot}/.editorconfig`, `${extensionRoot}/.editorconfig`)
  fs.copyFileSync(`${templatesRoot}/.prettierrc.json`, `${extensionRoot}/.prettierrc.json`)
  fs.copyFileSync(`${templatesRoot}/eslint.config.js`, `${extensionRoot}/eslint.config.js`)
  fs.copyFileSync(`${templatesRoot}/import-sorter.json`, `${extensionRoot}/import-sorter.json`)

  // Comment out `.vscode` in `.gitignore`.

  let gitignore = fs.readFileSync(`${extensionRoot}/.gitignore`, 'utf-8')

  gitignore = gitignore.replace('.vscode', '# .vscode')
  fs.writeFileSync(`${extensionRoot}/.gitignore`, gitignore, {
    encoding: 'utf-8',
  })

  // Add `tsconfig.json`.

  fs.writeFileSync(
    `${extensionRoot}/tsconfig.json`,
    `{
  "extends": "./templates/.quasar/tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "rootDir": "./src",
    "outDir": "./dist",
    "paths": {}
  },
  "include": ["./src/**/*.ts"],
  "exclude": []
}
`,
    {
      encoding: 'utf-8',
    },
  )

  // Add all packages under `dependencies` and `devDependencies` from
  // `templates/package.json` to `package.json` under `devDependencies`.

  const templatesPackageJson = (
    await import(templatesPackageJsonFilePath, { with: { type: 'json' } })
  ).default
  const dependencies = {
    ...templatesPackageJson.dependencies,
    ...templatesPackageJson.devDependencies,
  }
  const dependenciesAsArray = []

  for (const prop in dependencies) {
    dependenciesAsArray.push({ path: `devDependencies.${prop}`, value: dependencies[prop] })
  }

  extendJsonFile(extensionPackageJsonFilePath, dependenciesAsArray)

  // Modify `import-sorter.json` file to ignore `dist`.

  extendJsonFile(path.resolve(`${extensionRoot}/import-sorter.json`), [
    {
      path: 'excludeGlob',
      value: [`**/${config.projectFolder}/dist/**`],
    },
  ])

  // Add `.prettierignore` file to ignore `dist`.

  fs.writeFileSync(
    `${extensionRoot}/.prettierignore`,
    `/dist
`,
    { encoding: 'utf-8' },
  )

  // Add `lint`, `format` and `clean` scripts to `package.json`.

  extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'scripts.lint',
      value:
        'eslint -c ./eslint.config.js "./src/**/*.{ts,js,cjs,mjs,vue}" && cd templates && yarn lint',
    },
    {
      path: 'scripts.lintf',
      value:
        'eslint -c ./eslint.config.js "./src/**/*.{ts,js,cjs,mjs,vue}" --fix && cd templates && yarn lint --fix',
    },
    {
      path: 'scripts.format',
      value:
        'prettier --write "**/*.{js,ts,vue,scss,html,md,json}" --ignore-path templates/.gitignore  --ignore-path .prettierignore',
    },
    {
      path: 'scripts.clean',
      value:
        'yarn format-imports src && yarn format-imports templates/modules && yarn format --log-level warn && yarn lintf',
    },
  ])
}

function finishExtensionProject() {
  // Exclude `dist` from search and `node_modules`, `.git` from compare.

  const settingsJson = path.resolve(`${extensionRoot}/.vscode/settings.json`)

  // Putting `path` in an array to keep it as a single property in JSON file.
  extendJsonFile(settingsJson, [{ path: ['search.exclude'], value: { dist: true } }])
  extendJsonFile(settingsJson, [
    { path: ['compareFolders.excludeFilter'], value: ['node_modules', '.git'] },
    { path: ['compareFolders.ignoreFileNameCase'], value: false },
  ])

  // Add build scripts.

  extendJsonFile(extensionPackageJsonFilePath, [
    { path: 'scripts.build', value: 'npx tsc && cd templates && yarn tsc' },
    { path: 'scripts.watch', value: 'npx tsc --watch' },
    {
      path: 'scripts.buildPaths',
      value: 'cd ./templates && node ./buildPaths.js && npx prettier --write ./tsconfig-paths.json',
    },
  ])

  // Install the extension packages, build and clean code.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    `Installing \x1b[47m${config.extensionId}\x1b[0m packages, build and clean code...`,
  )

  fixExtensionQuasarAppVite()
  execSync(`cd ${extensionRoot} && yarn && yarn build && yarn clean`, {
    stdio: 'inherit',
  })
}

function launchExtensionProject() {
  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    `Launching \x1b[47m${config.extensionId}\x1b[0m in Visual Studio Code...`,
  )

  execSync(`code ${extensionRoot}`, {
    stdio: 'inherit',
  })
}

// TODO: Remove when Quasar fixes this bug
function fixExtensionQuasarAppVite() {
  fs.copyFileSync(`${globalAssets}/fixQuasarAppVite.js`, `${extensionRoot}/fixQuasarAppVite.js`)
  extendJsonFile(extensionPackageJsonFilePath, [
    { path: 'scripts.postinstall', value: 'node fixQuasarAppVite.js' },
  ])
}

// TODO: Remove when Quasar fixes this bug
function fixTemplatesQuasarAppVite() {
  fs.copyFileSync(`${globalAssets}/fixQuasarAppVite.js`, `${templatesRoot}/fixQuasarAppVite.js`)
  extendJsonFile(templatesPackageJsonFilePath, [
    { path: 'scripts.postinstall', value: 'node fixQuasarAppVite.js && quasar prepare' },
  ])
}
