import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import {
  ACCEPT_DEFAULT,
  DOWN_KEY,
  WHITESPACE_KEY,
  cliGhostwriter,
} from '@dreamonkey/cli-ghostwriter';

import commitCode from './lib/commit-code.js';
import fixCompileTimeYarnPnP from './lib/fix-compile-time-yarn-pnp.js';
import setupFormatLint from './lib/format-lintn.js';
import { extendJsonFile, reduceJsonFile } from './lib/json-helpers.js';
import packagesVersion from './lib/packages-version.js';
import patchQuasarAppVite from './lib/patches/patch-quasar-app-vite.js';
import type { CreateExtensionConfig } from './types';

const globalAssets = './assetsn';
const project = process.argv[2];
const runYarn = process.argv[3] === '-y' || process.argv[4] === '-y';
const autoLaunch = process.argv[3] === '-l' || process.argv[4] === '-l';
const config = (await import(`../projects/${project}/project.js`)).default as CreateExtensionConfig;
const projectAssets = `./projects/${project}/assets`;
const extensionRoot = `../quasar-generate-output/${config.projectFolder}`;
const templatesRoot = `${extensionRoot}/templates`;
const devRoot = `${extensionRoot}/dev`;
const extensionPackageJsonFilePath = path.resolve(`${extensionRoot}/package.json`);
const templatesPackageJsonFilePath = path.resolve(`${templatesRoot}/package.json`);
const devPackageJsonFilePath = path.resolve(`${devRoot}/package.json`);

// Turning on/off functions
const f = false;

// Create workspaces
f || (await createExtensionQuasarProject());
f || createTemplatesWorkspace();
f || (await createDevQuasarProject());
f || setPackagesInfo();
f || prepareWorkspaces();

// Fix Yarn PnP for Quasar `dev` and `build`
// After this fix, Quasar `dev` and `build` will always work with no error in `dev` workspace.
f || fixCompileTimeYarnPnP(extensionRoot, devRoot, true);

// Workspaces formatting and linting
f || rootWorkspaceFormattingAndLinting();
f || devWorkspaceFormattingAndLinting();
f || templatesWorkspaceFormattingAndLinting(); // `templates` workspace is copying files from `dev` workspace, so it needs to be called after `dev` workspace.
f || rootWorkspaceFormattingAndLintingScrips();

// Workspaces base source code
f || rootWorkspaceSrc();
f || templatesWorkspaceSrc();
f || devWorkspaceSrc();

// Finish workspaces
f || finishRootWorkspace();
f || finishTemplatesWorkspace();
f || finishDevWorkspace();

// Finish all and launch
f || finishAllAndLaunch();

// Create workspaces

async function createExtensionQuasarProject() {
  // Create Quasar project for the extension.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    `Creating Quasar project for \x1b[47m${config.extensionId}\x1b[0m...`,
  );

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
  };

  await cliGhostwriter({
    command: 'yarn create quasar',
    answersMap: answersMap,
    endingMarker: 'Enjoy! - Quasar Team',
  });
}

function createTemplatesWorkspace() {
  // Create initial `templates` workspace.

  fs.mkdirSync(`${templatesRoot}/modules`, { recursive: true });

  fs.writeFileSync(
    `${templatesRoot}/modules/index.ts`,
    `// Dump file to prevent \`lint\` script from rasing error.
// Remove this file if any code was added.
`,
    { encoding: 'utf-8' },
  );

  fs.writeFileSync(
    `${templatesRoot}/package.json`,
    `{
  "name": "${config.extensionId}-templates",
  "type": "module",
  "private": true
}
`,
    { encoding: 'utf-8' },
  );

  // Commit code.

  commitCode(extensionRoot, '\\`createTemplatesWorkspace()\\`');
}

async function createDevQuasarProject() {
  // Create Quasar project for `dev` workspace.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    'Creating Quasar project for \x1b[47mdev\x1b[0m...',
  );

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
  };

  await cliGhostwriter({
    command: 'yarn create quasar',
    answersMap: answersMap,
    endingMarker: 'Enjoy! - Quasar Team',
  });

  // Commit code.

  commitCode(extensionRoot, '\\`createDevQuasarProject()\\`');
}

function setPackagesInfo() {
  extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'version',
      value: config.version,
    },
    {
      path: 'author',
      value: config.author,
    },
  ]);

  reduceJsonFile(devPackageJsonFilePath, ['version', 'author']);

  // Commit code.

  commitCode(extensionRoot, '\\`setPackagesInfo()\\`');
}

function prepareWorkspaces() {
  // Define workspaces.

  extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'workspaces',
      value: ['dev', 'templates'],
    },
  ]);

  // Add root workspace as a dependency in `dev` workspace.

  extendJsonFile(devPackageJsonFilePath, [
    {
      path: `devDependencies.@${config.organizationName}/quasar-app-extension-${config.extensionId}`,
      value: 'workspace:*',
    },
  ]);

  // Commit code.

  commitCode(extensionRoot, '\\`prepareWorkspaces()\\`');
}

// Workspaces formatting and linting

function rootWorkspaceFormattingAndLinting() {
  // Copy `.vscode`, `.editorconfig`, `prettier.config.js` and `eslint.config.js` from `dev` workspace.

  fs.cpSync(`${devRoot}/.vscode`, `${extensionRoot}/.vscode`, { recursive: true });
  fs.copyFileSync(`${devRoot}/.editorconfig`, `${extensionRoot}/.editorconfig`);
  fs.copyFileSync(`${devRoot}/.prettierrc.json`, `${extensionRoot}/.prettierrc.json`);
  fs.copyFileSync(`${devRoot}/eslint.config.js`, `${extensionRoot}/eslint.config.js`);

  // Add `.prettierignore` to ignore `.yarn` and `dist`.

  fs.writeFileSync(
    `${extensionRoot}/.prettierignore`,
    `/.yarn
/dist
.pnp.*
`,
    { encoding: 'utf-8' },
  );

  // Add `eslint.config.js` specific dependencies.

  const packages: (keyof typeof packagesVersion)[] = [
    '@eslint/js',
    'globals',
    'eslint-plugin-vue',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
    'vue-eslint-parser',
  ];
  extendJsonFile(
    extensionPackageJsonFilePath,
    packages.map((item) => ({
      path: `devDependencies.${item}`,
      value: packagesVersion[item],
    })),
  );

  // Setup formatting and linting.

  setupFormatLint(extensionRoot);

  // Since there are multiple `eslint.config.js` and `tsconfig.json` files in the project,
  // we need to set `tsconfigRootDir` for each `eslint.config.js` to avoid
  // Parsing error: No tsconfigRootDir was set, and multiple candidate TSConfigRootDirs are present.
  // Trimming some vue specific configurations too.

  let eslintConfigJs = fs.readFileSync(`${extensionRoot}/eslint.config.js`, 'utf-8');

  eslintConfigJs = eslintConfigJs.replace(
    `import pluginVue from 'eslint-plugin-vue'
import pluginQuasar from '@quasar/app-vite/eslint'
`,
    '',
  );

  eslintConfigJs = eslintConfigJs.replace(
    `/**
     * Ignore the following files.
     * Please note that pluginQuasar.configs.recommended() already ignores
     * the "node_modules" folder for you (and all other Quasar project
     * relevant folders and files).
     *
     * ESLint requires "ignores" key to be the only one in this object
     */
    // ignores: []`,
    `ignores: ['.yarn/*', 'dist/*', 'templates/*', 'dev/*', '.pnp.*'],`,
  );

  eslintConfigJs = eslintConfigJs.replace(
    `  pluginQuasar.configs.recommended(),
`,
    '',
  );

  eslintConfigJs = eslintConfigJs.replace(
    `  /**
   * https://eslint.vuejs.org
   *
   * pluginVue.configs.base
   *   -> Settings and rules to enable correct ESLint parsing.
   * pluginVue.configs[ 'flat/essential']
   *   -> base, plus rules to prevent errors or unintended behavior.
   * pluginVue.configs["flat/strongly-recommended"]
   *   -> Above, plus rules to considerably improve code readability and/or dev experience.
   * pluginVue.configs["flat/recommended"]
   *   -> Above, plus rules to enforce subjective community defaults to ensure consistency.
   */
  pluginVue.configs[ 'flat/recommended' ],`,
    `{
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },`,
  );

  eslintConfigJs = eslintConfigJs.replace("files: ['**/*.ts', '**/*.vue'],", "files: ['**/*.ts'],");

  eslintConfigJs = eslintConfigJs.replace(
    `
      // alphabetical
      'vue/attributes-order': ['warn', { alphabetical: true }]
`,
    '',
  );

  eslintConfigJs = eslintConfigJs.replace(
    `
  {
    files: [ 'src-pwa/custom-service-worker.ts' ],
    languageOptions: {
      globals: {
        ...globals.serviceworker
      }
    }
  },
`,
    '',
  );

  fs.writeFileSync(`${extensionRoot}/eslint.config.js`, eslintConfigJs, {
    encoding: 'utf-8',
  });

  // Commit code.

  commitCode(extensionRoot, '\\`rootWorkspaceFormattingAndLinting()\\`');
}

function devWorkspaceFormattingAndLinting() {
  // Setup formatting and linting.

  setupFormatLint(devRoot);

  // All formatting and some lingting tools were coppied to root workspace, remove them here.

  fs.rmSync(`${devRoot}/.vscode`, { recursive: true });
  fs.rmSync(`${devRoot}/.editorconfig`);
  fs.rmSync(`${devRoot}/prettier.config.js`);

  // Remove unplugged settings and Prettier plugin with its patch.

  reduceJsonFile(devPackageJsonFilePath, [
    'dependenciesMeta',
    'devDependencies.@trivago/prettier-plugin-sort-imports',
  ]);

  fs.rmSync(`${devRoot}/.yarn`, { recursive: true });

  // Since there are multiple `eslint.config.js` and `tsconfig.json` files in the project,
  // we need to set `tsconfigRootDir` for each `eslint.config.js` to avoid
  // Parsing error: No tsconfigRootDir was set, and multiple candidate TSConfigRootDirs are present.

  let eslintConfigJs = fs.readFileSync(`${devRoot}/eslint.config.js`, 'utf-8');

  eslintConfigJs = eslintConfigJs.replace(
    "pluginVue.configs[ 'flat/recommended' ],",
    `pluginVue.configs[ 'flat/recommended' ],

  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },`,
  );

  fs.writeFileSync(`${devRoot}/eslint.config.js`, eslintConfigJs, {
    encoding: 'utf-8',
  });

  // Add `clean` script.

  extendJsonFile(devPackageJsonFilePath, [
    {
      path: 'scripts.clean',
      value: 'yarn format --log-level warn && yarn lint --fix',
    },
  ]);

  // Commit code.

  commitCode(extensionRoot, '\\`devWorkspaceFormattingAndLinting()\\`');
}

function templatesWorkspaceFormattingAndLinting() {
  // Copy `eslint.config.js` from `dev` workspace.

  fs.copyFileSync(`${devRoot}/eslint.config.js`, `${templatesRoot}/eslint.config.js`);

  // Add dependencies for formatting and linting.

  const packages: (keyof typeof packagesVersion)[] = [
    'eslint',
    'prettier',

    // `eslint.config.js` specific dependencies
    '@eslint/js',
    'globals',
    'eslint-plugin-vue',
    '@quasar/app-vite',
    'quasar', // Peer dependency of `@quasar/app-vite`
    'vue', // Peer dependency of `@quasar/app-vite`
    'vue-router', // Peer dependency of `@quasar/app-vite`
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
    'vue-eslint-parser',
  ];
  extendJsonFile(
    templatesPackageJsonFilePath,
    packages.map((item) => ({
      path: `devDependencies.${item}`,
      value: packagesVersion[item],
    })),
  );

  // Add `lint`, `format` and `clean` scripts.

  extendJsonFile(templatesPackageJsonFilePath, [
    {
      path: 'scripts.lint',
      value: 'eslint -c ./eslint.config.js "./modules/**/*.{ts,js,cjs,mjs,vue}"',
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
  ]);

  // Commit code.

  commitCode(extensionRoot, '\\`templatesWorkspaceFormattingAndLinting()\\`');
}

function rootWorkspaceFormattingAndLintingScrips() {
  // Add `lint`, `lintf`, `format` and `clean` scripts.

  reduceJsonFile(extensionPackageJsonFilePath, ['scripts.clean']);
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
        'prettier --write "**/*.{js,ts,vue,scss,html,md,json}" --ignore-path dev/.gitignore --ignore-path .prettierignore',
    },
    {
      path: 'scripts.clean',
      value: 'yarn format --log-level warn && yarn lintf',
    },
  ]);

  // Commit code.

  commitCode(extensionRoot, '\\`rootWorkspaceFormattingAndLintingScrips()\\`');
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
  );

  // Add `src` specific dependencies.

  const packages: (keyof typeof packagesVersion)[] = [
    '@quasar/app-vite',
    'quasar', // Peer dependency of `@quasar/app-vite`
    'vue-router', // Peer dependency of `@quasar/app-vite`
    'lodash-es',
    '@types/lodash-es',
  ];
  extendJsonFile(
    extensionPackageJsonFilePath,
    packages.map((item) => ({
      path: `devDependencies.${item}`,
      value: packagesVersion[item],
    })),
  );

  // Delete `src` folder.

  fs.rmSync(`${extensionRoot}/src`, { recursive: true });

  // Add `src` from global `assets`.

  fs.cpSync(`${globalAssets}/Multi-module Extension Template/src`, `${extensionRoot}/src`, {
    recursive: true,
  });

  // Patch `@quasar/app-vite`.

  patchQuasarAppVite(extensionRoot, extensionPackageJsonFilePath);

  // Add workspace template.

  const extensionAssets = `${projectAssets}/templates/root`;

  if (fs.existsSync(extensionAssets)) {
    fs.readdirSync(extensionAssets).forEach((file) => {
      fs.cpSync(path.join(extensionAssets, file), path.join(extensionRoot, file), {
        recursive: true,
        force: true,
      });
    });
  }

  // Commit code.

  commitCode(extensionRoot, '\\`rootWorkspaceSrc()\\`');
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
  );

  // Add `templates` from global `assets`.

  fs.cpSync(
    `${globalAssets}/Multi-module Extension Template/templates`,
    `${extensionRoot}/templates`,
    {
      recursive: true,
    },
  );

  // Add workspace template.

  const templatesAssets = `${projectAssets}/templates/templates`;

  if (fs.existsSync(templatesAssets)) {
    fs.readdirSync(templatesAssets).forEach((file) => {
      fs.cpSync(path.join(templatesAssets, file), path.join(templatesRoot, file), {
        recursive: true,
        force: true,
      });
    });
  }

  // Commit code.

  commitCode(extensionRoot, '\\`templatesWorkspaceSrc()\\`');
}

function devWorkspaceSrc() {
  // Add extension config file.

  fs.writeFileSync(
    `${devRoot}/.${config.extensionId.replace(/-/g, '')}rc.js`,
    `export default {
  modules: {},
};
`,
    { encoding: 'utf-8' },
  );

  // Add workspace template.

  const devAssets = `${projectAssets}/templates/dev`;

  if (fs.existsSync(devAssets)) {
    fs.readdirSync(devAssets).forEach((file) => {
      fs.cpSync(path.join(devAssets, file), path.join(devRoot, file), {
        recursive: true,
        force: true,
      });
    });
  }

  // Commit code.

  commitCode(extensionRoot, '\\`devWorkspaceSrc()\\`');
}

// Finish workspaces

function finishRootWorkspace() {
  // Exclude `.yarn`, `dist` from search and `node_modules`, `.git` from compare.

  const extensionsJsonFilePath = path.resolve(`${extensionRoot}/.vscode/extensions.json`);
  const settingsJsonFilePath = path.resolve(`${extensionRoot}/.vscode/settings.json`);

  extendJsonFile(extensionsJsonFilePath, [
    { path: 'recommendations[]', value: 'moshfeu.compare-folders' },
  ]);

  // Putting `path` in an array to keep it as a single property in JSON file.
  extendJsonFile(settingsJsonFilePath, [
    { path: ['search.exclude', '.yarn'], value: true },
    { path: ['search.exclude', 'dist'], value: true },
  ]);
  extendJsonFile(settingsJsonFilePath, [
    { path: ['compareFolders.excludeFilter'], value: ['node_modules', '.git'] },
    { path: ['compareFolders.ignoreFileNameCase'], value: false },
  ]);

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
  ]);

  // Commit code.

  commitCode(extensionRoot, '\\`finishRootWorkspace()\\`');
}

function finishTemplatesWorkspace() {
  // Add `vue-tsc`.

  const packages: (keyof typeof packagesVersion)[] = [
    'vue-tsc',
    'typescript', // Peer dependency of `vue-tsc`
  ];
  extendJsonFile(
    templatesPackageJsonFilePath,
    packages.map((item) => ({
      path: `devDependencies.${item}`,
      value: packagesVersion[item],
    })),
  );

  // Add build script.

  extendJsonFile(templatesPackageJsonFilePath, [
    {
      path: 'scripts.tsc',
      value: 'yarn vue-tsc --noEmit --skipLibCheck',
    },
  ]);

  // Commit code.

  commitCode(extensionRoot, '\\`finishTemplatesWorkspace()\\`');
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
  ]);

  // Commit code.

  commitCode(extensionRoot, '\\`finishDevWorkspace()\\`');
}

// Finish all and launch

function finishAllAndLaunch() {
  // Install root workspace packages, build and clean code.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    `Installing \x1b[47m${config.extensionId}\x1b[0m packages, build and clean code...`,
  );

  if (runYarn) {
    execSync(
      `cd ${extensionRoot} && yarn && cd dev && yarn postinstall && cd .. && yarn buildPaths && yarn build && yarn clean && cd dev && yarn i-${config.extensionId} && yarn dev`,
      {
        stdio: 'inherit',
      },
    );
  } else {
    console.log(
      `                   Run \x1b[47mcd ${extensionRoot} && yarn && cd dev && yarn postinstall && cd .. && yarn buildPaths && yarn build && yarn clean && cd dev && yarn i-${config.extensionId} && yarn dev\x1b[0m manually.`,
    );
  }

  // Auto launch

  if (autoLaunch) {
    console.log(
      ' \x1b[32mquasar-generate •\x1b[0m',
      `Launching \x1b[47m${config.extensionId}\x1b[0m in Visual Studio Code...`,
    );

    execSync(`code ${extensionRoot}`, {
      stdio: 'inherit',
    });
  }
}
