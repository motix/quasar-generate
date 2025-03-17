import { execSync } from 'child_process'
import fs from 'fs'
import { repeat } from 'lodash-es'
import path from 'path'

import {
  ACCEPT_DEFAULT,
  cliGhostwriter,
  DOWN_KEY,
  WHITESPACE_KEY,
} from '@dreamonkey/cli-ghostwriter'

import { extendJsonFile } from './lib/json-helpers.js'
import type { CreateFirebaseConfig } from './types'

const globalAssets = './assets'
const project = process.argv[2]
const autoLaunch = process.argv[3]
const config = (await import(`../projects/${project}/project.js`)).default as CreateFirebaseConfig
const firebaseRoot = `./output/${config.projectFolder}`
const functionsRoot = `${firebaseRoot}/functions`
const firebasePackageJsonFilePath = path.resolve(`${firebaseRoot}/package.json`)
const functionsPackageJsonFilePath = path.resolve(`${functionsRoot}/package.json`)

// Turning on/off functions
const f = false

f || (await createFirebasePackage())
f || initFirebasePackage()
f || firebasePackageLintingAndFormatting()
f || initFunctionsPackage()
f || functionsPackageLintingAndFormatting()
f || createFunctionsCodebases()
f ||
  ['default', ...config.functionsCodebases].forEach((codebase) => finishFunctionsPackage(codebase))
f || finishFirebasePackage()

if (autoLaunch === '-l') {
  f || launchFirebasePackage()
}

async function createFirebasePackage() {
  // Init Firebase package.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    `Creating Firebase package for \x1b[47m${config.packageName}\x1b[0m...`,
  )

  execSync(`mkdir ${firebaseRoot}`)

  const answersMap: Record<string, string | undefined> = {
    'Which Firebase features do you want to set up for this directory?': `${DOWN_KEY}${WHITESPACE_KEY}${DOWN_KEY}${DOWN_KEY}${WHITESPACE_KEY}${DOWN_KEY}${DOWN_KEY}${DOWN_KEY}${WHITESPACE_KEY}${DOWN_KEY}${WHITESPACE_KEY}`, // Firestore, Functions, Storage, Emulators
    'Please select an option:': ACCEPT_DEFAULT, // Use an existing project
    'Select a default Firebase project for this directory:': `${repeat(DOWN_KEY, config.firebaseProjectPosition)}`,
    'What file should be used for Firestore Rules?': ACCEPT_DEFAULT, // firestore.rules
    'What file should be used for Firestore indexes?': ACCEPT_DEFAULT, // firestore.indexes.json
    'What language would you like to use to write Cloud Functions?': `${DOWN_KEY}${WHITESPACE_KEY}`, // TypeScript
    'Do you want to use ESLint to catch probable bugs and enforce style?': 'n',
    'Do you want to install dependencies with npm now?': 'n',
    'What file should be used for Storage Rules?': ACCEPT_DEFAULT, // storage.rules
    'Which Firebase emulators do you want to set up?': `${DOWN_KEY}${WHITESPACE_KEY}${DOWN_KEY}${WHITESPACE_KEY}${DOWN_KEY}${WHITESPACE_KEY}${DOWN_KEY}${DOWN_KEY}${DOWN_KEY}${DOWN_KEY}${WHITESPACE_KEY}`, // Authentication, Functions, Firestore, Storage
    'Which port do you want to use for the auth emulator?': `${config.authEmulatorPort}`,
    'Which port do you want to use for the functions emulator?': `${config.functionsEmulatorPort}`,
    'Which port do you want to use for the firestore emulator?': `${config.firestoreEmulatorPort}`,
    'Which port do you want to use for the storage emulator?': `${config.storageEmulatorPort}`,
    'Would you like to enable the Emulator UI?': ACCEPT_DEFAULT, // Y
    'Which port do you want to use for the Emulator UI': `${config.emulatorUiPort}`,
    'Would you like to download the emulators now?': ACCEPT_DEFAULT, // Y
  }

  await cliGhostwriter({
    command: `cd ${firebaseRoot} && firebase init`,
    answersMap,
    endingMarker: 'Firebase initialization complete!',
  })
}

function initFirebasePackage() {
  // Create `package.json`.

  fs.writeFileSync(
    firebasePackageJsonFilePath,
    JSON.stringify({
      name: config.packageName,
      private: true,
    }),
    'utf-8',
  )
}

function firebasePackageLintingAndFormatting() {
  // Add dependencies and scripts.

  extendJsonFile(firebasePackageJsonFilePath, [
    {
      path: 'scripts.format',
      value:
        'prettier --write "**/*.{*js,ts,md,json}" --ignore-path .gitignore  --ignore-path .prettierignore',
    },
    {
      path: 'scripts.lint',
      value: 'eslint .',
    },
    {
      path: 'scripts.clean',
      value: 'yarn format --log-level warn && yarn lint --fix',
    },
    {
      path: 'devDependencies.@eslint/js',
      value: '^9.22.0',
    },
    {
      path: 'devDependencies.eslint',
      value: '^9.22.0',
    },
    {
      path: 'devDependencies.globals',
      value: '^16.0.0',
    },
    {
      path: 'devDependencies.prettier',
      value: '^3.5.3',
    },
  ])

  // Add `.editorconfig`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore` and `.vscode/settings.json`.

  fs.copyFileSync(`${globalAssets}/.editorconfig`, `${firebaseRoot}/.editorconfig`)
  fs.copyFileSync(
    `${globalAssets}/Firebase Template/eslint.config.mjs`,
    `${firebaseRoot}/eslint.config.mjs`,
  )
  fs.copyFileSync(
    `${globalAssets}/Firebase Template/.prettierrc.json`,
    `${firebaseRoot}/.prettierrc.json`,
  )
  fs.copyFileSync(
    `${globalAssets}/Firebase Template/.prettierignore`,
    `${firebaseRoot}/.prettierignore`,
  )
  fs.mkdirSync(`${firebaseRoot}/.vscode`)
  fs.copyFileSync(
    `${globalAssets}/Firebase Template/.vscode/settings.json`,
    `${firebaseRoot}/.vscode/settings.json`,
  )

  // Add `import-sorter.json`.

  fs.copyFileSync(`${globalAssets}/import-sorter.json`, `${firebaseRoot}/import-sorter.json`)
}

function initFunctionsPackage() {
  // Set `type` as `module` and upgrade dependencies.

  extendJsonFile(functionsPackageJsonFilePath, [
    {
      path: 'type',
      value: 'module',
    },
    {
      path: 'scripts.deploy',
      value: 'firebase deploy --only functions:default',
    },
    {
      path: 'dependencies.firebase-admin',
      value: '^13.2.0',
    },
    {
      path: 'dependencies.firebase-functions',
      value: '^6.3.2',
    },
    {
      path: 'devDependencies.typescript',
      value: '^5.8.2',
    },
    {
      path: 'devDependencies.firebase-functions-test',
      value: '^3.4.1',
    },
  ])

  // Set `compilerOptions`.

  extendJsonFile(`${functionsRoot}/tsconfig.json`, [
    {
      path: 'compilerOptions.allowUnreachableCode',
      value: false,
    },
    {
      path: 'compilerOptions.allowUnusedLabels',
      value: false,
    },
    {
      path: 'compilerOptions.noImplicitOverride',
      value: true,
    },
    {
      path: 'compilerOptions.exactOptionalPropertyTypes',
      value: true,
    },
    {
      path: 'compilerOptions.noUncheckedIndexedAccess',
      value: true,
    },
  ])

  // Setup module.

  // `src`
  fs.rmSync(`${functionsRoot}/src`, { recursive: true })
  fs.cpSync(`${globalAssets}/Firebase Template/functions/src`, `${functionsRoot}/src`, {
    recursive: true,
  })

  // `group.ts`
  fs.writeFileSync(
    `${functionsRoot}/src/group.ts`,
    `// export * from ...
`,
    'utf-8',
  )

  // `index.ts`
  fs.writeFileSync(
    `${functionsRoot}/src/index.ts`,
    `import { initializeApp } from 'firebase-admin/app';
import { setGlobalOptions } from 'firebase-functions/v2';

initializeApp();

setGlobalOptions({
  region: '${config.functionsRegion}',
});

// Making sure \`group.js\` only starts loading after \`setGlobalOptions\` is called
const group = await import('./group.js');

export const app = group;
`,
    'utf-8',
  )

  // Setup `refUpdate`.

  fs.copyFileSync(
    `${globalAssets}/Firebase Template/functions/refUpdate.mjs`,
    `${functionsRoot}/refUpdate.mjs`,
  )
  fs.copyFileSync(
    `${globalAssets}/Firebase Template/functions/alias.mjs`,
    `${functionsRoot}/alias.mjs`,
  )

  // Setup `tsc-alias`.

  extendJsonFile(functionsPackageJsonFilePath, [
    {
      path: 'scripts.build',
      value: 'tsc && tsc-alias',
    },
    {
      path: 'scripts.build:watch',
      value: 'tsc && (concurrently "tsc -w" "tsc-alias -w")',
    },
    {
      path: 'devDependencies.tsc-alias',
      value: '^1.8.11',
    },
  ])
}

function functionsPackageLintingAndFormatting() {
  // Add dependencies and scripts.

  extendJsonFile(functionsPackageJsonFilePath, [
    {
      path: 'scripts.format',
      value: 'prettier --write "./src/**/*.ts"',
    },
    {
      path: 'scripts.lint',
      value: 'eslint .',
    },
    {
      path: 'scripts.clean',
      value: 'yarn format-imports ./src && yarn format --log-level warn && yarn lint --fix',
    },
    {
      path: 'devDependencies.@eslint/js',
      value: '^9.22.0',
    },
    {
      path: 'devDependencies.eslint',
      value: '^9.22.0',
    },
    {
      path: 'devDependencies.globals',
      value: '^16.0.0',
    },
    {
      path: 'devDependencies.prettier',
      value: '^3.5.3',
    },
    {
      path: 'devDependencies.typescript-eslint',
      value: '^8.26.1',
    },
    {
      path: 'devDependencies.format-imports',
      value: '^4.0.7',
    },
  ])

  // Add `eslint.config.mjs` and `.vscode/settings.json`.

  fs.copyFileSync(
    `${globalAssets}/Firebase Template/functions/eslint.config.mjs`,
    `${functionsRoot}/eslint.config.mjs`,
  )
  fs.mkdirSync(`${functionsRoot}/.vscode`)
  fs.copyFileSync(
    `${globalAssets}/Firebase Template/functions/.vscode/settings.json`,
    `${functionsRoot}/.vscode/settings.json`,
  )

  // Add lint to `predeploy` script.

  extendJsonFile(`${firebaseRoot}/firebase.json`, [
    {
      path: 'functions[0].predeploy',
      value: ['npm --prefix "$RESOURCE_DIR" run lint', 'npm --prefix "$RESOURCE_DIR" run build'],
    },
  ])
}

function createFunctionsCodebases() {
  for (const codebase of config.functionsCodebases) {
    const codebaseRoot = `${functionsRoot}-${codebase}`

    fs.cpSync(functionsRoot, codebaseRoot, { recursive: true })

    // Trim shared code.

    fs.rmSync(`${codebaseRoot}/alias.mjs`)
    fs.rmSync(`${codebaseRoot}/src/models`, { recursive: true })
    fs.rmSync(`${codebaseRoot}/src/types`, { recursive: true })
    fs.rmSync(`${codebaseRoot}/src/utils`, { recursive: true })

    // Modify `package.json`.

    extendJsonFile(`${codebaseRoot}/package.json`, [
      {
        path: 'name',
        value: `functions-${codebase}`,
      },
      {
        path: 'scripts.deploy',
        value: `firebase deploy --only functions:${codebase}`,
      },
      {
        path: 'main',
        value: `lib/functions-${codebase}/src/index.js`,
      },
    ])

    // Modify `firebase.json`.

    extendJsonFile(`${firebaseRoot}/firebase.json`, [
      {
        path: 'functions[]',
        value: {
          source: `functions-${codebase}`,
          codebase,
          ignore: ['node_modules', '.git', 'firebase-debug.log', 'firebase-debug.*.log', '*.local'],
          predeploy: [
            'npm --prefix "$RESOURCE_DIR" run lint',
            'npm --prefix "$RESOURCE_DIR" run build',
          ],
        },
      },
    ])

    // Modify `.prettierignore`.

    let prettierignore = fs.readFileSync(`${firebaseRoot}/.prettierignore`, { encoding: 'utf-8' })
    prettierignore += `\n/functions-${codebase}/lib`
    fs.writeFileSync(`${firebaseRoot}/.prettierignore`, prettierignore, { encoding: 'utf-8' })

    // Modify `index.ts`.

    let indexts = fs.readFileSync(`${codebaseRoot}/src/index.ts`, { encoding: 'utf-8' })
    indexts = indexts.replace('export const app = group;', `export const ${codebase} = group;`)
    fs.writeFileSync(`${codebaseRoot}/src/index.ts`, indexts, { encoding: 'utf-8' })
  }
}

function finishFunctionsPackage(codebase: string) {
  const root = codebase === 'default' ? functionsRoot : `${functionsRoot}-${codebase}`

  // Install functions packages and clean code.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    `Installing \x1b[47m${codebase}\x1b[0m codebase \x1b[47mfunctions\x1b[0m packages and clean code...`,
  )

  execSync(`cd ${root} && yarn && node refUpdate.mjs`, {
    stdio: 'inherit',
  })
}

function finishFirebasePackage() {
  // Install Firebase packages and clean code.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    'Installing \x1b[47mFirebase\x1b[0m packages and clean code...',
  )

  execSync(`cd ${firebaseRoot} && yarn && yarn clean`, {
    stdio: 'inherit',
  })
}

function launchFirebasePackage() {
  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    `Launching \x1b[47m${config.packageName}\x1b[0m in Visual Studio Code...`,
  )

  execSync(`code ${firebaseRoot}`, {
    stdio: 'inherit',
  })
}
