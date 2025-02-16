import type { CreateExtensionConfig } from './types'

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import { ACCEPT_DEFAULT, cliGhostwriter, DOWN_KEY } from '@dreamonkey/cli-ghostwriter'

import { extendJsonFile, reduceJsonFile, reduceJsonFileArray } from './lib/json-helpers.js'

const project = process.argv[2]
const config = (await import(`../projects/${project}.js`)).default as CreateExtensionConfig
const extensionRoot = `output/${config.projectFolder}`
const templatesRoot = `${extensionRoot}/templates`
const extensionPackageJsonFilePath = path.resolve(`./${extensionRoot}/package.json`)
const templatesPackageJsonFilePath = path.resolve(`./${templatesRoot}/package.json`)

// Turning on/off functions
const f = false

f || (await createQuasarProjects())
f || (await cleanTemplatesProject())
f || (await templatesProjectLintingAndFormatting())
f || finishTemplatesProject()
f || cleanExtensionProject()
f || (await extensionProjectLintingAndFormatting())
f || (await finishExtensionProject())

async function createQuasarProjects() {
  // 1. Create Quasar project for the extension.

  const extensionAnswersMap: Record<string, string | undefined> = {
    'What would you like to build?': `${DOWN_KEY}`, // AppExtension (AE) for Quasar CLI
    'Project folder': `output/${config.projectFolder}`,
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
    answersMap: extensionAnswersMap,
    endingMarker: 'Enjoy! - Quasar Team',
  })

  // 2. In newly created project, create another Quasar project for templates.

  const templatesAnswersMap: Record<string, string | undefined> = {
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
    answersMap: templatesAnswersMap,
    endingMarker: 'Enjoy! - Quasar Team',
  })
}

async function cleanTemplatesProject() {
  // 3. Delete `templates/public`, `templates/src`,
  // `templates/postcss.config.js`, `templates/README.md`.

  fs.rmSync(`./${templatesRoot}/public`, { recursive: true })
  fs.rmSync(`./${templatesRoot}/src`, { recursive: true })
  fs.rmSync(`./${templatesRoot}/postcss.config.js`, { recursive: true })
  fs.rmSync(`./${templatesRoot}/README.md`, { recursive: true })

  // 4. Modify `templates/index.html` content.

  fs.writeFileSync(
    `./${templatesRoot}/index.html`,
    `<!-- Supports quasar prepare -->

<!-- quasar:entry-point -->
`,
    { encoding: 'utf-8' },
  )

  // 5. Modify `templates/quasar.config.ts` content.

  fs.writeFileSync(
    `./${templatesRoot}/quasar.config.ts`,
    `// Supports quasar prepare

export default () => {
  return {}
}
`,
    { encoding: 'utf-8' },
  )

  // 6. Uninstall packages: `@quasar/extras`, `vue-tsc`, `vite-plugin-checker`,
  // `@types/node`, `autoprefixer` and upgrade all remaining packages to latest.

  await reduceJsonFile(templatesPackageJsonFilePath, [
    'dependencies.@quasar/extras',
    'devDependencies.vue-tsc',
    'devDependencies.vite-plugin-checker',
    'devDependencies.@types/node',
    'devDependencies.autoprefixer',
  ])

  await extendJsonFile(templatesPackageJsonFilePath, [
    { path: 'dependencies.quasar', value: '^2.17.7' },
    { path: 'dependencies.vue', value: '^3.5.13' },
    { path: 'dependencies.vue-router', value: '^4.5.0' },
    { path: 'devDependencies.@eslint/js', value: '^9.20.0' },
    { path: 'devDependencies.eslint', value: '^9.20.1' },
    { path: 'devDependencies.eslint-plugin-vue', value: '^9.32.0' },
    { path: 'devDependencies.globals', value: '^15.15.0' },
    { path: 'devDependencies.@vue/eslint-config-typescript', value: '^14.4.0' },
    { path: 'devDependencies.@vue/eslint-config-prettier', value: '^10.2.0' },
    { path: 'devDependencies.prettier', value: '^3.5.1' },
    { path: 'devDependencies.@quasar/app-vite', value: '^2.1.0' },
    { path: 'devDependencies.typescript', value: '^5.7.3' },
  ])

  // 7. Create folder `templates/modules` and add default file.

  fs.mkdirSync(`./${templatesRoot}/modules`, { recursive: true })

  fs.writeFileSync(
    `./${templatesRoot}/modules/index.ts`,
    `// Dump file to prevent \`lint\` script from rasing error.
// Remove this file if any code was added.
`,
    { encoding: 'utf-8' },
  )
}

async function templatesProjectLintingAndFormatting() {
  const templatesExtensionsJson = path.resolve(`./${templatesRoot}/.vscode/extensions.json`)
  const templatesSettingsJson = path.resolve(`./${templatesRoot}/.vscode/settings.json`)

  // 8. Add `format-imports` to `templates/package.json` and add `import-sorter.json` from `assets` to `templates`.

  await extendJsonFile(templatesPackageJsonFilePath, [
    { path: 'devDependencies.format-imports', value: '^4.0.7' },
  ])

  fs.copyFileSync('./assets/import-sorter.json', `./${templatesRoot}/import-sorter.json`)

  // 9. Modify templates/.vscode/extensions.json and templates/.vscode/settings.json

  await extendJsonFile(templatesExtensionsJson, [
    { path: 'recommendations[]', value: 'rohit-gohri.format-code-action' },
    { path: 'recommendations[]', value: 'dozerg.tsimportsorter' },
  ])

  // Default setting would often lead to Prettier
  // being run after ESLint and ESLint errors still being present.

  await reduceJsonFileArray(templatesSettingsJson, [
    {
      path: 'editor.codeActionsOnSave',
      value: 'source.fixAll.eslint',
    },
  ])

  await extendJsonFile(templatesSettingsJson, [
    { path: 'editor.formatOnSave', value: false },
    { path: 'editor.codeActionsOnSave[]', value: 'source.formatDocument' },
    { path: 'editor.codeActionsOnSave[]', value: 'source.fixAll.eslint' },
  ])

  // 10. Modify `templates/eslint.config.js`.

  let eslintConfig = fs.readFileSync(`./${templatesRoot}/eslint.config.js`, 'utf-8')

  eslintConfig = eslintConfig.replace(
    "  ...pluginVue.configs[ 'flat/essential' ],",
    "  ...pluginVue.configs[ 'flat/recommended' ],",
  )

  eslintConfig = eslintConfig.replace(
    `      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' }
      ],`,
    `      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' }
      ],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],`,
  )

  eslintConfig = eslintConfig.replace(
    "      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'",
    `      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

      // alphabetical
      'vue/attributes-order': ['warn', { alphabetical: true }]`,
  )

  fs.writeFileSync(`./${templatesRoot}/eslint.config.js`, eslintConfig, {
    encoding: 'utf-8',
  })

  // 11. Modify `templates/package.json` `lint` script, changing `src*` to `modules`
  // and add `clean` script.

  await extendJsonFile(templatesPackageJsonFilePath, [
    {
      path: 'scripts.lint',
      value: 'eslint -c ./eslint.config.js "./modules/**/*.{ts,js,cjs,mjs,vue}"',
    },
    {
      path: 'scripts.clean',
      value: 'yarn format-imports modules && yarn format && yarn lint --fix',
    },
  ])
}

function finishTemplatesProject() {
  // 12. Install templates project packages and clean code.

  execSync(`cd ${templatesRoot} && yarn && yarn clean && cd ../../..`, { stdio: 'inherit' })
}

function cleanExtensionProject() {
  // 13. Delete `src` folder.

  fs.rmSync(`./${extensionRoot}/src`, { recursive: true })

  // 14. Add `src` from `assets`.

  fs.cpSync(`./assets/Multi-module Extension Template/src`, `./${extensionRoot}/src`, {
    recursive: true,
  })
}

async function extensionProjectLintingAndFormatting() {
  // 15. Copy `.vscode`, `.editorconfig`, `.prettierrc.json`, `eslint.config.js`,
  // `import-sorter.json` from `templates` to root.

  fs.cpSync(`./${templatesRoot}/.vscode`, `./${extensionRoot}/.vscode`, { recursive: true })
  fs.copyFileSync(`./${templatesRoot}/.editorconfig`, `./${extensionRoot}/.editorconfig`)
  fs.copyFileSync(`./${templatesRoot}/.prettierrc.json`, `./${extensionRoot}/.prettierrc.json`)
  fs.copyFileSync(`./${templatesRoot}/eslint.config.js`, `./${extensionRoot}/eslint.config.js`)
  fs.copyFileSync(`./${templatesRoot}/import-sorter.json`, `./${extensionRoot}/import-sorter.json`)

  // 16. Comment out `.vscode` in `.gitignore`.

  let gitignore = fs.readFileSync(`./${extensionRoot}/.gitignore`, 'utf-8')

  gitignore = gitignore.replace('.vscode', '# .vscode')
  fs.writeFileSync(`./${extensionRoot}/.gitignore`, gitignore, {
    encoding: 'utf-8',
  })

  // 17. Add `tsconfig.json`

  fs.writeFileSync(
    `./${extensionRoot}/tsconfig.json`,
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

  // 18. Add all packages under `dependencies` and `devDependencies` from
  // `templates/package.json` to `package.json` under `devDependencies`.

  const templatesPackageJson = (
    await import(templatesPackageJsonFilePath, { with: { type: 'json' } })
  ).default

  await extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'devDependencies',
      value: {
        ...templatesPackageJson.dependencies,
        ...templatesPackageJson.devDependencies,
      },
    },
  ])

  // 19. Add `lint`, `format` and `clean` scripts to `package.json`.

  await extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'scripts.lint',
      value:
        'eslint -c ./eslint.config.js "./src/**/*.{ts,js,cjs,mjs,vue}" && cd templates && yarn lint && cd ..',
    },
    {
      path: 'scripts.format',
      value:
        'prettier --write "**/*.{js,ts,vue,scss,html,md,json}" --ignore-path templates/.gitignore',
    },
    {
      path: 'scripts.clean',
      value:
        'yarn format-imports src && yarn format-imports templates/modules && yarn format && yarn lint --fix',
    },
  ])
}

async function finishExtensionProject() {
  // 20. Add build script.

  await extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'scripts.build',
      value: 'npx tsc',
    },
  ])

  // 21. Install extension project packages, build and clean code.

  execSync(`cd ${extensionRoot} && yarn && yarn build && yarn clean && cd ../..`, {
    stdio: 'inherit',
  })
}
