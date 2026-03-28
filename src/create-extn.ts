import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import {
  ACCEPT_DEFAULT,
  cliGhostwriter,
  DOWN_KEY,
  WHITESPACE_KEY,
} from '@dreamonkey/cli-ghostwriter'

import setupFormatLint from './lib/format-lintn.js'
import { extendJsonFile, reduceJsonFile } from './lib/json-helpers.js'
import type { CreateExtensionConfig } from './types'
import packagesVersion from './lib/packages-version.js'

const globalAssets = './assetsn'
const project = process.argv[2]
const runYarn = process.argv[3] === '-y' || process.argv[4] === '-y'
const autoLaunch = process.argv[3] === '-l' || process.argv[4] === '-l'
const config = (await import(`../projects/${project}.js`)).default as CreateExtensionConfig
const extensionRoot = `../quasar-generate-output/${config.projectFolder}`
const templatesRoot = `${extensionRoot}/templates`
const devRoot = `${extensionRoot}/dev`
const extensionPackageJsonFilePath = path.resolve(`${extensionRoot}/package.json`)
const templatesPackageJsonFilePath = path.resolve(`${templatesRoot}/package.json`)
const devPackageJsonFilePath = path.resolve(`${devRoot}/package.json`)

// Turning on/off functions
const f = false

// Create workspaces
f || (await createExtensionQuasarProject())
f || createTemplatesWorkspace()
f || (await createDevQuasarProject())
f || prepareWorkspaces()

// Fix Yarn PnP for Quasar `dev` and `build`
// After this fix, Quasar `dev` and `build` will always work with no error in `dev` workspace.
f || fixCompileTimeYarnPnP()

// Workspaces formatting and linting
f || rootWorkspaceFormattingAndLinting()
f || templatesWorkspaceFormattingAndLinting()
f || devWorkspaceFormattingAndLinting()
f || rootWorkspaceFormattingAndLintingScrips()

// Workspaces base source code
f || rootWorkspaceSrc()
f || templatesWorkspaceSrc()

// Finish workspaces
f || finishRootWorkspace()
f || finishTemplatesWorkspace()
f || finishDevWorkspace()

// Finish all and launch
f || finishAllAndLaunch()

// Create workspaces

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
    'License type': ACCEPT_DEFAULT, // MIT
    'Pick the needed scripts': 'a', // Prompts script, Install script, Uninstall script
  }

  await cliGhostwriter({
    command: 'yarn create quasar',
    answersMap: answersMap,
    endingMarker: 'Enjoy! - Quasar Team',
  })
}

function createTemplatesWorkspace() {
  // Create initial `templates` workspace.

  fs.mkdirSync(`${templatesRoot}/modules`, { recursive: true })

  fs.writeFileSync(
    `${templatesRoot}/modules/index.ts`,
    `// Dump file to prevent \`lint\` script from rasing error.
// Remove this file if any code was added.
`,
    { encoding: 'utf-8' },
  )

  fs.writeFileSync(
    `${templatesRoot}/package.json`,
    `{
  "name": "${config.extensionId}-templates",
  "type": "module",
  "private": true
}
`,
    { encoding: 'utf-8' },
  )

  // Commit code.

  commitCode('\\`createTemplatesWorkspace()\\`')
}

async function createDevQuasarProject() {
  // Create Quasar project for `dev` workspace.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    'Creating Quasar project for \x1b[47mdev\x1b[0m...',
  )

  const answersMap: Record<string, string | undefined> = {
    'What would you like to build?': ACCEPT_DEFAULT, // App with Quasar CLI
    'Project folder': devRoot,
    'Pick script type': `${DOWN_KEY}`, // Typescript
    'Pick Quasar App CLI variant': ACCEPT_DEFAULT, // Quasar App CLI with Vite
    'Package name': `${config.extensionId}-dev`,
    'Project product name': `${config.extensionId} Dev`,
    'Project description': `Dev for ${config.extensionId}`,
    'Pick a Vue component style': ACCEPT_DEFAULT, // Composition API with <script setup>
    'Pick your CSS preprocessor': ACCEPT_DEFAULT, // Sass with SCSS syntax
    'Check the features needed for your project': `${DOWN_KEY}${WHITESPACE_KEY}`, // Linting, Pinia
    'Add Prettier for code formatting?': ACCEPT_DEFAULT, // Y
    'Install project dependencies?': `${DOWN_KEY}`, // No
  }

  await cliGhostwriter({
    command: 'yarn create quasar',
    answersMap: answersMap,
    endingMarker: 'Enjoy! - Quasar Team',
  })

  // Commit code.

  commitCode('\\`createDevQuasarProject()\\`')
}

function prepareWorkspaces() {
  // Define workspaces.

  extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'workspaces',
      value: ['dev', 'templates'],
    },
  ])

  // Add root workspace as a dependency in `dev` workspace.

  extendJsonFile(devPackageJsonFilePath, [
    {
      path: `devDependencies.@${config.organizationName}/quasar-app-extension-${config.extensionId}`,
      value: 'workspace:*',
    },
  ])

  // Commit code.

  commitCode('\\`prepareWorkspaces()\\`')
}

// Fix Yarn PnP for Quasar `dev` and `build`

function fixCompileTimeYarnPnP() {
  let packages: (keyof typeof packagesVersion)[]

  // Add missing peer dependencies.

  packages = ['postcss', 'vite']
  extendJsonFile(
    devPackageJsonFilePath,
    packages.map((item) => ({
      path: `devDependencies.${item}`,
      value: packagesVersion[item],
    })),
  )

  // Patch and unplug `vite-plugin-checker`.

  // This will solve the error `TypeError: FlatESLint is not a constructor`.
  extendJsonFile(devPackageJsonFilePath, [
    {
      path: 'devDependencies.vite-plugin-checker',
      value:
        'patch:vite-plugin-checker@npm%3A0.12.0#~/.yarn/patches/vite-plugin-checker-npm-0.12.0-20cc09e28e.patch',
    },
  ])

  fs.mkdirSync(`${extensionRoot}/.yarn/patches`, { recursive: true })

  fs.writeFileSync(
    `${extensionRoot}/.yarn/patches/vite-plugin-checker-npm-0.12.0-20cc09e28e.patch`,
    `diff --git a/dist/checkers/eslint/main.js b/dist/checkers/eslint/main.js
index 27a775515049aa60f23c2778632b86d2db6d3513..28dbef5303639bea2d53e5cc8727deced3cb47ba 100644
--- a/dist/checkers/eslint/main.js
+++ b/dist/checkers/eslint/main.js
@@ -60,19 +60,26 @@ const createDiagnostic = (pluginConfig) => {
       };
       let eslint;
       if (pluginConfig.eslint.useFlatConfig) {
-        const {
-          FlatESLint,
-          shouldUseFlatConfig
-        } = require2("eslint/use-at-your-own-risk");
-        if (shouldUseFlatConfig == null ? void 0 : shouldUseFlatConfig()) {
-          eslint = new FlatESLint({
-            cwd: root
-          });
+        let ESLintClass;
+        const { loadESLint } = require2("eslint");
+        if (loadESLint) {
+          ESLintClass = await loadESLint({ useFlatConfig: true });
         } else {
-          throw Error(
-            "Please upgrade your eslint to latest version to use \`useFlatConfig\` option."
-          );
+          const {
+            FlatESLint,
+            shouldUseFlatConfig
+          } = require2("eslint/use-at-your-own-risk");
+          if (shouldUseFlatConfig == null ? void 0 : shouldUseFlatConfig()) {
+            ESLintClass = FlatESLint;
+          } else {
+            throw Error(
+              "Please upgrade your eslint to latest version to use \`useFlatConfig\` option."
+            );
+          }
         }
+        eslint = new ESLintClass({
+          cwd: root
+        });
       } else {
         eslint = new ESLint(eslintOptions);
       }
`,
    { encoding: 'utf-8' },
  )

  // This will solve the error
  // `EROFS: read-only filesystem, rm '/node_modules/vite-plugin-checker/dist/checkers/vueTsc/typescript-vue-tsc'`
  // after `vite-plugin-checker` was patched.
  extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'dependenciesMeta',
      value: {
        'vite-plugin-checker': {
          unplugged: true,
        },
      },
    },
  ])

  // Fix `vue-tsc` error with Quasar `$q` object.

  extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'devDependencies.vue',
      value: packagesVersion.vue,
    },
  ])

  // Install Yarn editor SDKs.

  // Adding packages at root workspace to support editor SDKs
  packages = ['eslint', 'prettier', 'typescript']
  extendJsonFile(extensionPackageJsonFilePath, [
    ...packages.map((item) => ({
      path: `devDependencies.${item}`,
      value: packagesVersion[item],
    })),
    // Everytime editor SDKs related packages are added or removed, update editor SDKs
    {
      path: 'scripts.postinstall',
      value: 'yarn dlx @yarnpkg/sdks vscode',
    },
  ])

  // Remove `typescript.tsdk` settings in `dev` workspace as it will be added to root workspace
  // after the `yarn dlx @yarnpkg/sdks vscode` call.

  const settingsJsonPath = path.resolve(`${devRoot}/.vscode/settings.json`)
  reduceJsonFile(settingsJsonPath, ['typescript.tsdk'])

  // Unignore `.vscode` to persist settings for editor SDKs.

  let gitignore = fs.readFileSync(`${extensionRoot}/.gitignore`, 'utf-8')

  gitignore = gitignore.replace('.vscode', '# .vscode')
  fs.writeFileSync(`${extensionRoot}/.gitignore`, gitignore, {
    encoding: 'utf-8',
  })

  // Commit code.

  execSync(
    `cd ${extensionRoot} && git add . && git commit -q -m "\\\`fixCompileTimeYarnPnP()\\\`"`,
    {
      stdio: 'inherit',
    },
  )
}

// Workspaces formatting and linting

function rootWorkspaceFormattingAndLinting() {
  // Move `.vscode`, `.editorconfig`, `prettier.config.js` and `eslint.config.js`
  // from `dev` workspace to root workspace.

  fs.renameSync(`${devRoot}/.vscode`, `${extensionRoot}/.vscode`)
  fs.renameSync(`${devRoot}/.editorconfig`, `${extensionRoot}/.editorconfig`)
  fs.renameSync(`${devRoot}/.prettierrc.json`, `${extensionRoot}/.prettierrc.json`)
  fs.renameSync(`${devRoot}/eslint.config.js`, `${extensionRoot}/eslint.config.js`)

  // Add `.prettierignore` to ignore `.yarn` and `dist`.

  fs.writeFileSync(
    `${extensionRoot}/.prettierignore`,
    `/.yarn
/dist
`,
    { encoding: 'utf-8' },
  )

  // Add `eslint.config.js` specific dependencies.

  const packages: (keyof typeof packagesVersion)[] = [
    '@eslint/js',
    'globals',
    'eslint-plugin-vue',
    '@quasar/app-vite',
    'quasar', // Peer dependencies of `@quasar/app-vite`
    'vue-router', // Peer dependencies of `@quasar/app-vite`
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
    'vue-eslint-parser',
  ]
  extendJsonFile(
    extensionPackageJsonFilePath,
    packages.map((item) => ({
      path: `devDependencies.${item}`,
      value: packagesVersion[item],
    })),
  )

  // Since `eslint.config.js` was moved from Quasar project in `dev`,
  // setting `projectService` is needed because the default detection
  // of sibling `tsconfig.json` in `dev` workspace is no longer available.

  let eslintConfigJs = fs.readFileSync(`${extensionRoot}/eslint.config.js`, 'utf-8')

  eslintConfigJs = eslintConfigJs.replace(
    "pluginVue.configs[ 'flat/essential' ],",
    `pluginVue.configs[ 'flat/essential' ],

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },`,
  )

  fs.writeFileSync(`${extensionRoot}/eslint.config.js`, eslintConfigJs, {
    encoding: 'utf-8',
  })

  // Setup formatting and linting.

  setupFormatLint(extensionRoot)

  // Commit code.

  commitCode('\\`rootWorkspaceFormattingAndLinting()\\`')
}

function templatesWorkspaceFormattingAndLinting() {
  // Add dependencies for formatting and linting.

  const packages: (keyof typeof packagesVersion)[] = ['eslint', 'prettier']
  extendJsonFile(templatesPackageJsonFilePath, [
    ...packages.map((item) => ({
      path: `devDependencies.${item}`,
      value: packagesVersion[item],
    })),
  ])

  // Add `lint`, `format` and `clean` scripts.

  extendJsonFile(templatesPackageJsonFilePath, [
    {
      path: 'scripts.lint',
      value: 'eslint -c ../eslint.config.js "./modules/**/*.{ts,js,cjs,mjs,vue}"',
    },
    {
      path: 'scripts.format',
      value:
        'prettier --write "**/*.{js,ts,vue,scss,html,md,json}" --ignore-path ../dev/.gitignore',
    },
    {
      path: 'scripts.clean',
      value: 'yarn format --log-level warn && yarn lint --fix',
    },
  ])

  // Commit code.

  commitCode('\\`templatesWorkspaceFormattingAndLinting()\\`')
}

function devWorkspaceFormattingAndLinting() {
  // Linting and formatting tools were moved to root workspace.
  // Do the clean up in `dev` workspace.

  // Remove formating and lingting dependencies that were moved to root workspace.

  const packages: (keyof typeof packagesVersion)[] = [
    '@eslint/js',
    'globals',
    'eslint-plugin-vue',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
    'vue-eslint-parser',
  ]
  reduceJsonFile(
    devPackageJsonFilePath,
    packages.map((item) => `devDependencies.${item}`),
  )

  // Update `quasar.config.ts` using `eslint.config.js` in root workspace.

  let quasarConfigTs = fs.readFileSync(`${devRoot}/quasar.config.ts`, 'utf-8')

  quasarConfigTs = quasarConfigTs.replace(
    'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
    'eslint -c ../eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
  )

  fs.writeFileSync(`${devRoot}/quasar.config.ts`, quasarConfigTs, {
    encoding: 'utf-8',
  })

  // Update `lint` script using `eslint.config.js` in root workspace.

  extendJsonFile(devPackageJsonFilePath, [
    {
      path: 'scripts.lint',
      value: 'eslint -c ../eslint.config.js "./src*/**/*.{ts,js,cjs,mjs,vue}"',
    },
  ])

  // Add `clean` script.

  extendJsonFile(devPackageJsonFilePath, [
    {
      path: 'scripts.clean',
      value: 'yarn format --log-level warn && yarn lint --fix',
    },
  ])

  // Commit code.

  commitCode('\\`devWorkspaceFormattingAndLinting()\\`')
}

function rootWorkspaceFormattingAndLintingScrips() {
  // Add `lint`, `lintf`, `format` and `clean` scripts.

  reduceJsonFile(extensionPackageJsonFilePath, ['scripts.clean'])
  extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'scripts.lint',
      value:
        'eslint -c ./eslint.config.js "./src/**/*.{ts,js,cjs,mjs,vue}" && cd templates && yarn lint && cd ../dev && yarn lint',
    },
    {
      path: 'scripts.lintf',
      value:
        'eslint -c ./eslint.config.js "./src/**/*.{ts,js,cjs,mjs,vue}" --fix && cd templates && yarn lint --fix && cd ../dev && yarn lint --fix',
    },
    {
      path: 'scripts.format',
      value:
        'prettier --write "**/*.{js,ts,vue,scss,html,md,json}" --ignore-path dev/.gitignore  --ignore-path .prettierignore',
    },
    {
      path: 'scripts.clean',
      value: 'yarn format --log-level warn && yarn lintf',
    },
  ])

  // Commit code.

  commitCode('\\`rootWorkspaceFormattingAndLintingScrips()\\`')
}

// Workspaces base source code

function rootWorkspaceSrc() {
  // Add `tsconfig.json`.

  fs.writeFileSync(
    `${extensionRoot}/tsconfig.json`,
    `{
  "extends": "./dev/.quasar/tsconfig.json",
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

  // Add `src` specific dependencies.

  const packages: (keyof typeof packagesVersion)[] = ['lodash-es', '@types/lodash-es']
  extendJsonFile(
    extensionPackageJsonFilePath,
    packages.map((item) => ({
      path: `devDependencies.${item}`,
      value: packagesVersion[item],
    })),
  )

  // Delete `src` folder.

  fs.rmSync(`${extensionRoot}/src`, { recursive: true })

  // Add `src` from global `assets`.

  fs.cpSync(`${globalAssets}/Multi-module Extension Template/src`, `${extensionRoot}/src`, {
    recursive: true,
  })

  // Patch `@quasar/app-vite` to gain access to `@quasar/app-vite/lib/app-extension/api-classes/InstallAPI.js`
  // and `@quasar/app-vite/lib/utils/get-caller-path.js`.

  extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'devDependencies.@quasar/app-vite',
      value:
        'patch:@quasar/app-vite@npm%3A2.5.2#~/.yarn/patches/@quasar-app-vite-npm-2.5.2-129f3acda8.patch',
    },
  ])

  fs.mkdirSync(`${extensionRoot}/.yarn/patches`, { recursive: true })

  fs.writeFileSync(
    `${extensionRoot}/.yarn/patches/@quasar-app-vite-npm-2.5.2-129f3acda8.patch`,
    `diff --git a/package.json b/package.json
index 1323ca347f470900c9b791a63862186489e323bf..049101b1db6b2aeb076f3c0839cee3f777f3ff5c 100644
--- a/package.json
+++ b/package.json
@@ -48,6 +48,12 @@
     },
     "./lib/testing.js": {
       "import": "./exports/testing/testing.js"
+    },
+    "./lib/app-extension/api-classes/InstallAPI.js": {
+      "import": "./lib/app-extension/api-classes/InstallAPI.js"
+    },
+    "./lib/utils/get-caller-path.js": {
+      "import": "./lib/utils/get-caller-path.js"
     }
   },
   "keywords": [
`,
    { encoding: 'utf-8' },
  )

  // Commit code.

  commitCode('\\`rootWorkspaceSrc()\\`')
}

function templatesWorkspaceSrc() {
  // Add `tsconfig.json`.

  fs.writeFileSync(
    `${templatesRoot}/tsconfig.json`,
    `{
  "extends": "./tsconfig-paths.json",
  "include": ["../dev/**/*.d.ts", "../dev/.quasar/**/*.d.ts", "./**/*"]
}
`,
    {
      encoding: 'utf-8',
    },
  )

  // Add `templates` from global `assets`.

  fs.cpSync(
    `${globalAssets}/Multi-module Extension Template/templates`,
    `${extensionRoot}/templates`,
    {
      recursive: true,
    },
  )

  // Commit code.

  commitCode('\\`templatesWorkspaceSrc()\\`')
}

// Finish workspaces

function finishRootWorkspace() {
  // Exclude `.yarn`, `dist` from search and `node_modules`, `.git` from compare.

  const extensionsJsonFilePath = path.resolve(`${extensionRoot}/.vscode/extensions.json`)
  const settingsJsonFilePath = path.resolve(`${extensionRoot}/.vscode/settings.json`)

  extendJsonFile(extensionsJsonFilePath, [
    { path: 'recommendations[]', value: 'moshfeu.compare-folders' },
  ])

  // Putting `path` in an array to keep it as a single property in JSON file.
  extendJsonFile(settingsJsonFilePath, [
    { path: ['search.exclude', '.yarn'], value: true },
    { path: ['search.exclude', 'dist'], value: true },
  ])
  extendJsonFile(settingsJsonFilePath, [
    { path: ['compareFolders.excludeFilter'], value: ['node_modules', '.git'] },
    { path: ['compareFolders.ignoreFileNameCase'], value: false },
  ])

  // Add build scripts.

  extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'scripts.build',
      value: 'yarn tsc && cd ./templates && yarn tsc && cd ../dev && yarn tsc',
    },
    { path: 'scripts.watch', value: 'yarn tsc --watch' },
    {
      path: 'scripts.buildPaths',
      value:
        'cd ./templates && node ./buildPaths.js && yarn prettier --write ./tsconfig-paths.json',
    },
  ])

  // Commit code.

  commitCode('\\`finishRootWorkspace()\\`')
}

function finishTemplatesWorkspace() {
  // Add `vue-tsc`.

  const packages: (keyof typeof packagesVersion)[] = [
    'vue-tsc',
    'typescript', // Peer dependencies of `vue-tsc`
  ]
  extendJsonFile(
    templatesPackageJsonFilePath,
    packages.map((item) => ({
      path: `devDependencies.${item}`,
      value: packagesVersion[item],
    })),
  )

  // Add build script.

  extendJsonFile(templatesPackageJsonFilePath, [
    {
      path: 'scripts.tsc',
      value: 'yarn vue-tsc --noEmit --skipLibCheck',
    },
  ])

  // Commit code.

  commitCode('\\`finishTemplatesWorkspace()\\`')
}

function finishDevWorkspace() {
  // Add build script and extension invoke script.

  extendJsonFile(devPackageJsonFilePath, [
    {
      path: 'scripts.tsc',
      value: 'yarn vue-tsc --noEmit --skipLibCheck',
    },
    {
      path: `scripts.i-${config.extensionId}`,
      value: `quasar ext invoke @${config.organizationName}/${config.extensionId} && yarn format --log-level warn`,
    },
  ])

  // Commit code.

  commitCode('\\`finishDevWorkspace()\\`')
}

// Finish all and launch

function finishAllAndLaunch() {
  // Install root workspace packages, build and clean code.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    `Installing \x1b[47m${config.extensionId}\x1b[0m packages, build and clean code...`,
  )

  if (runYarn) {
    execSync(
      `cd ${extensionRoot} && yarn && yarn buildPaths && yarn build && yarn clean && cd dev && yarn i-mnapp && yarn dev`,
      {
        stdio: 'inherit',
      },
    )
  } else {
    console.log(
      `                   Run \x1b[47mcd ${extensionRoot} && yarn && yarn buildPaths && yarn build && yarn clean && cd dev && yarn i-mnapp && yarn dev\x1b[0m manually.`,
    )
  }

  // Auto launch

  if (autoLaunch) {
    console.log(
      ' \x1b[32mquasar-generate •\x1b[0m',
      `Launching \x1b[47m${config.extensionId}\x1b[0m in Visual Studio Code...`,
    )

    execSync(`code ${extensionRoot}`, {
      stdio: 'inherit',
    })
  }
}

// Internal

function commitCode(message: string) {
  execSync(`cd ${extensionRoot} && git add . && git commit -q -m "${message}"`, {
    stdio: 'inherit',
  })
}
