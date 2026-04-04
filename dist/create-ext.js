import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ACCEPT_DEFAULT, DOWN_KEY, WHITESPACE_KEY, cliGhostwriter, } from '@dreamonkey/cli-ghostwriter';
import commitCode from './lib/commit-code.js';
import fixCompileTimeYarnPnP from './lib/fix-compile-time-yarn-pnp.js';
import { extendJsonFile, reduceJsonFile, reorderJsonFile } from './lib/json-helpers.js';
import packagesVersion from './lib/packages-version.js';
import patchQuasarAppVite from './lib/patches/patch-quasar-app-vite.js';
import setupFormatLint from './lib/setup-format-lint.js';
const globalAssets = './assets';
const project = process.argv[2];
const runYarn = process.argv[3] === '-y' || process.argv[4] === '-y';
const autoLaunch = process.argv[3] === '-l' || process.argv[4] === '-l';
const config = (await import(`../projects/${project}/project.js`)).default;
const projectAssets = `./projects/${project}/assets`;
const extensionName = `quasar-app-extension-${config.extensionId}`;
const rootWorkspaceFolder = `../quasar-generate-output/${config.projectFolder}`;
const extensionWorkspaceFolder = config.monorepo
    ? `${rootWorkspaceFolder}/${extensionName}`
    : rootWorkspaceFolder;
const templatesWorkspaceFolder = `${extensionWorkspaceFolder}/templates`;
const devWorkspaceFolder = `${extensionWorkspaceFolder}/dev`;
const rootPackageJsonFilePath = path.resolve(`${rootWorkspaceFolder}/package.json`);
const extensionPackageJsonFilePath = path.resolve(`${extensionWorkspaceFolder}/package.json`);
const templatesPackageJsonFilePath = path.resolve(`${templatesWorkspaceFolder}/package.json`);
const devPackageJsonFilePath = path.resolve(`${devWorkspaceFolder}/package.json`);
const extensionPackageName = `@${config.organizationName}/${extensionName}`;
console.log(' \x1b[32mquasar-generate •\x1b[0m', `Create extension \x1b[47m${extensionPackageName}\x1b[0m`);
// Turning on/off functions
const f = false;
// Create workspaces
f || (config.monorepo && createRootWorkspace());
f || (await createExtensionQuasarProject());
f || createTemplatesWorkspace();
f || (await createDevQuasarProject());
f || setPackagesInfo();
f || prepareWorkspaces();
f || refineGitignore();
// Fix Yarn PnP for Quasar `dev` and `build`
f ||
    fixCompileTimeYarnPnP({
        rootWorkspaceFolder,
        targetWorkspaceFolder: devWorkspaceFolder,
        commitCodeMessage: '',
    });
// Workspaces formatting and linting
f || rootWorkspaceFormattingAndLinting();
f || devWorkspaceFormattingAndLinting();
f || templatesWorkspaceFormattingAndLinting(); // `templates` workspace copies files from `dev` workspace, so it needs to be called after `dev` workspace.
f || rootWorkspaceFormattingAndLintingScrips();
// Workspaces base source code
f || extensionWorkspaceSrc();
f || templatesWorkspaceSrc();
f || devWorkspaceSrc();
// Finish workspaces
f || finishRootWorkspace();
f || finishExtensionWorkspace();
f || finishTemplatesWorkspace();
f || finishDevWorkspace();
// Install and launch
f || installAndLaunch();
// Create workspaces
function createRootWorkspace() {
    // Create initial root workspace.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Creating \x1b[33mroot\x1b[0m workspace...`);
    fs.mkdirSync(`${rootWorkspaceFolder}`, { recursive: true });
    fs.writeFileSync(rootPackageJsonFilePath, `{
  "name": "${config.extensionId}-root",
  "type": "module",
  "private": true
}
`, { encoding: 'utf-8' });
    // Init git.
    execSync(`cd ${rootWorkspaceFolder.replaceAll(' ', '\\ ')} && git init -q`, {
        stdio: 'inherit',
    });
    // Commit code.
    commitCode(rootWorkspaceFolder, '\\`createRootWorkspace()\\`');
}
async function createExtensionQuasarProject() {
    // Create Quasar project for the extension.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Creating Quasar project for \x1b[33mextension\x1b[0m workspace...`);
    const answersMap = {
        'What would you like to build?': `${DOWN_KEY}`, // AppExtension (AE) for Quasar CLI
        'Project folder': extensionWorkspaceFolder,
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
    // Commit code.
    // Remove the default commit created by Quasar CLI.
    if (!config.monorepo) {
        execSync(`cd ${rootWorkspaceFolder.replaceAll(' ', '\\ ')} && git update-ref -d HEAD`, {
            stdio: 'inherit',
        });
    }
    commitCode(rootWorkspaceFolder, '\\`createExtensionQuasarProject()\\`');
}
function createTemplatesWorkspace() {
    // Create initial `templates` workspace.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Creating \x1b[33mtemplates\x1b[0m workspace...`);
    fs.mkdirSync(`${templatesWorkspaceFolder}/modules`, { recursive: true });
    fs.writeFileSync(`${templatesWorkspaceFolder}/modules/index.ts`, `// Dump file to prevent \`lint\` script from rasing error.
// Remove this file if any code was added.
`, { encoding: 'utf-8' });
    fs.writeFileSync(templatesPackageJsonFilePath, `{
  "name": "${config.extensionId}-templates",
  "type": "module",
  "private": true
}
`, { encoding: 'utf-8' });
    // Commit code.
    commitCode(rootWorkspaceFolder, '\\`createTemplatesWorkspace()\\`');
}
async function createDevQuasarProject() {
    // Create Quasar project for `dev` workspace.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', 'Creating Quasar project for \x1b[33mdev\x1b[0m workspace...');
    const answersMap = {
        'What would you like to build?': ACCEPT_DEFAULT, // App with Quasar CLI
        'Project folder': devWorkspaceFolder,
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
    commitCode(rootWorkspaceFolder, '\\`createDevQuasarProject()\\`');
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
    commitCode(rootWorkspaceFolder, '\\`setPackagesInfo()\\`');
}
function prepareWorkspaces() {
    // Define workspaces.
    extendJsonFile(rootPackageJsonFilePath, [
        {
            path: 'workspaces',
            value: config.monorepo
                ? [extensionName, `${extensionName}/templates`, `${extensionName}/dev`]
                : ['templates', 'dev'],
        },
    ]);
    // Add extension workspace as a dependency in `dev` workspace.
    extendJsonFile(devPackageJsonFilePath, [
        {
            path: `devDependencies.${extensionPackageName}`,
            value: 'workspace:*',
        },
    ]);
    // Commit code.
    commitCode(rootWorkspaceFolder, '\\`prepareWorkspaces()\\`');
}
function refineGitignore() {
    const rootDotGitignoreFilePath = path.resolve(`${rootWorkspaceFolder}/.gitignore`);
    const extensionDotGitignoreFilePath = path.resolve(`${extensionWorkspaceFolder}/.gitignore`);
    if (config.monorepo) {
        fs.renameSync(extensionDotGitignoreFilePath, rootDotGitignoreFilePath);
    }
    let dotGitignore = fs.readFileSync(rootDotGitignoreFilePath, { encoding: 'utf-8' });
    dotGitignore = `${dotGitignore}
# Yarn PnP
.yarn/cache/
.yarn/sdks/
.yarn/unplugged/
.yarn/install-state.gz
`;
    dotGitignore = dotGitignore.replace('.vscode', '# .vscode');
    fs.writeFileSync(rootDotGitignoreFilePath, dotGitignore, { encoding: 'utf-8' });
}
// Workspaces formatting and linting
function rootWorkspaceFormattingAndLinting() {
    // Copy `.vscode`, `.editorconfig`, `.prettierrc.json` and `eslint.config.js` from `dev` workspace.
    fs.cpSync(`${devWorkspaceFolder}/.vscode`, `${rootWorkspaceFolder}/.vscode`, { recursive: true });
    fs.copyFileSync(`${devWorkspaceFolder}/.editorconfig`, `${rootWorkspaceFolder}/.editorconfig`);
    fs.copyFileSync(`${devWorkspaceFolder}/.prettierrc.json`, `${rootWorkspaceFolder}/.prettierrc.json`);
    fs.copyFileSync(`${devWorkspaceFolder}/eslint.config.js`, `${rootWorkspaceFolder}/eslint.config.js`);
    // Add `.prettierignore` to ignore `.yarn` and `dist`.
    fs.writeFileSync(`${rootWorkspaceFolder}/.prettierignore`, `/.yarn
/${config.monorepo ? `${extensionName}/` : ''}dist
.pnp.*
`, { encoding: 'utf-8' });
    // Add `eslint.config.js` specific dependencies.
    const packages = [
        '@eslint/js',
        'globals',
        'eslint-plugin-vue',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier',
        'vue-eslint-parser',
    ];
    extendJsonFile(rootPackageJsonFilePath, packages.map((item) => ({
        path: `devDependencies.${item}`,
        value: packagesVersion[item],
    })));
    // Setup formatting and linting.
    setupFormatLint({ rootWorkspaceFolder, targetWorkspaceFolder: rootWorkspaceFolder });
    // Since there are multiple `eslint.config.js` and `tsconfig.json` files in the project,
    // we need to set `tsconfigRootDir` for each `eslint.config.js` to avoid
    // Parsing error: No tsconfigRootDir was set, and multiple candidate TSConfigRootDirs are present.
    // Trimming some vue specific configurations too.
    let eslintConfigJs = fs.readFileSync(`${rootWorkspaceFolder}/eslint.config.js`, 'utf-8');
    eslintConfigJs = eslintConfigJs.replace(`import pluginVue from 'eslint-plugin-vue'
import pluginQuasar from '@quasar/app-vite/eslint'
`, '');
    eslintConfigJs = eslintConfigJs.replace(`/**
     * Ignore the following files.
     * Please note that pluginQuasar.configs.recommended() already ignores
     * the "node_modules" folder for you (and all other Quasar project
     * relevant folders and files).
     *
     * ESLint requires "ignores" key to be the only one in this object
     */
    // ignores: []`, `ignores: ['.yarn/*', '${config.monorepo ? `${extensionName}/` : ''}dev/*', '${config.monorepo ? `${extensionName}/` : ''}dist/*', '${config.monorepo ? `${extensionName}/` : ''}templates/*', '.pnp.*'],`);
    eslintConfigJs = eslintConfigJs.replace(`  pluginQuasar.configs.recommended(),
`, '');
    eslintConfigJs = eslintConfigJs.replace(`  /**
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
  pluginVue.configs[ 'flat/recommended' ],`, `{
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },`);
    eslintConfigJs = eslintConfigJs.replace("files: ['**/*.ts', '**/*.vue'],", "files: ['**/*.ts'],");
    eslintConfigJs = eslintConfigJs.replace(`
      // alphabetical
      'vue/attributes-order': ['warn', { alphabetical: true }]
`, '');
    eslintConfigJs = eslintConfigJs.replace(`
  {
    files: [ 'src-pwa/custom-service-worker.ts' ],
    languageOptions: {
      globals: {
        ...globals.serviceworker
      }
    }
  },
`, '');
    fs.writeFileSync(`${rootWorkspaceFolder}/eslint.config.js`, eslintConfigJs, {
        encoding: 'utf-8',
    });
    // Commit code.
    commitCode(rootWorkspaceFolder, '\\`rootWorkspaceFormattingAndLinting()\\`');
}
function devWorkspaceFormattingAndLinting() {
    // Setup formatting and linting.
    setupFormatLint({ targetWorkspaceFolder: devWorkspaceFolder });
    // All formatting and some lingting tools were available in root workspace, remove them here.
    fs.rmSync(`${devWorkspaceFolder}/.vscode`, { recursive: true });
    fs.rmSync(`${devWorkspaceFolder}/.editorconfig`);
    fs.rmSync(`${devWorkspaceFolder}/.prettierrc.json`);
    // Since there are multiple `eslint.config.js` and `tsconfig.json` files in the project,
    // we need to set `tsconfigRootDir` for each `eslint.config.js` to avoid
    // Parsing error: No tsconfigRootDir was set, and multiple candidate TSConfigRootDirs are present.
    let eslintConfigJs = fs.readFileSync(`${devWorkspaceFolder}/eslint.config.js`, 'utf-8');
    eslintConfigJs = eslintConfigJs.replace("pluginVue.configs[ 'flat/recommended' ],", `pluginVue.configs[ 'flat/recommended' ],

  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },`);
    fs.writeFileSync(`${devWorkspaceFolder}/eslint.config.js`, eslintConfigJs, {
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
    commitCode(rootWorkspaceFolder, '\\`devWorkspaceFormattingAndLinting()\\`');
}
function templatesWorkspaceFormattingAndLinting() {
    // Copy `eslint.config.js` from `dev` workspace.
    fs.copyFileSync(`${devWorkspaceFolder}/eslint.config.js`, `${templatesWorkspaceFolder}/eslint.config.js`);
    // Add dependencies for formatting and linting.
    const packages = [
        'eslint',
        'prettier',
        // `eslint.config.js` specific dependencies
        '@eslint/js',
        'globals',
        'eslint-plugin-vue',
        '@quasar/app-vite',
        'quasar', // Peer dependency of `@quasar/app-vite`
        'typescript', // Peer dependency of `@quasar/app-vite`
        'vue', // Peer dependency of `@quasar/app-vite`
        'vue-router', // Peer dependency of `@quasar/app-vite`
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier',
        'vue-eslint-parser',
    ];
    extendJsonFile(templatesPackageJsonFilePath, packages.map((item) => ({
        path: `devDependencies.${item}`,
        value: packagesVersion[item],
    })));
    // Add `lint`, `format` and `clean` scripts.
    extendJsonFile(templatesPackageJsonFilePath, [
        {
            path: 'scripts.lint',
            value: 'eslint -c ./eslint.config.js "./modules/**/*.{ts,js,cjs,mjs,vue}"',
        },
        {
            path: 'scripts.format',
            value: 'prettier --write "**/*.{js,ts,vue,scss,html,md,json}" --ignore-path ../dev/.gitignore',
        },
        {
            path: 'scripts.clean',
            value: 'yarn format --log-level warn && yarn lint --fix',
        },
    ]);
    // Commit code.
    commitCode(rootWorkspaceFolder, '\\`templatesWorkspaceFormattingAndLinting()\\`');
}
function rootWorkspaceFormattingAndLintingScrips() {
    // Add `lint`, `lintf`, `format` and `clean` scripts.
    reduceJsonFile(rootPackageJsonFilePath, ['scripts.clean']);
    extendJsonFile(rootPackageJsonFilePath, [
        {
            path: 'scripts.lint',
            value: `eslint -c ./eslint.config.js "./${config.monorepo ? `${extensionName}/` : ''}src/**/*.{ts,js,cjs,mjs,vue}" && cd ./${config.monorepo ? `${extensionName}/` : ''}templates && yarn lint && cd ../dev && yarn lint`,
        },
        {
            path: 'scripts.lintf',
            value: `eslint -c ./eslint.config.js "./${config.monorepo ? `${extensionName}/` : ''}src/**/*.{ts,js,cjs,mjs,vue}" --fix && cd ./${config.monorepo ? `${extensionName}/` : ''}templates && yarn lint --fix && cd ../dev && yarn lint --fix`,
        },
        {
            path: 'scripts.format',
            value: `prettier --write "**/*.{js,ts,vue,scss,html,md,json}" --ignore-path ${config.monorepo ? `${extensionName}/` : ''}dev/.gitignore --ignore-path .prettierignore`,
        },
        {
            path: 'scripts.clean',
            value: 'yarn format --log-level warn && yarn lintf',
        },
    ]);
    // Commit code.
    commitCode(rootWorkspaceFolder, '\\`rootWorkspaceFormattingAndLintingScrips()\\`');
}
// Workspaces base source code
function extensionWorkspaceSrc() {
    // Add `tsconfig.json`.
    fs.writeFileSync(`${extensionWorkspaceFolder}/tsconfig.json`, `{
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
`, {
        encoding: 'utf-8',
    });
    // Add `src` specific dependencies.
    const packages = [
        '@quasar/app-vite',
        'quasar', // Peer dependency of `@quasar/app-vite`
        'vue', // Peer dependency of `@quasar/app-vite`
        'vue-router', // Peer dependency of `@quasar/app-vite`
        'lodash-es',
        '@types/lodash-es',
    ];
    // Quasar extensions run in host environment, so we need to add all dependencies to `dependencies`
    extendJsonFile(extensionPackageJsonFilePath, packages.map((item) => ({
        path: `dependencies.${item}`,
        value: packagesVersion[item],
    })));
    // Delete `src` folder.
    fs.rmSync(`${extensionWorkspaceFolder}/src`, { recursive: true });
    // Add `src` from global `assets`.
    fs.cpSync(`${globalAssets}/Multi-module Extension Template/src`, `${extensionWorkspaceFolder}/src`, {
        recursive: true,
    });
    // Patch `@quasar/app-vite`.
    patchQuasarAppVite({
        rootWorkspaceFolder,
        targetPackageJsonFilePath: extensionPackageJsonFilePath,
    });
    // Add project template.
    const extensionAssets = `${projectAssets}/templates/root`;
    if (fs.existsSync(extensionAssets)) {
        fs.readdirSync(extensionAssets).forEach((file) => {
            fs.cpSync(path.join(extensionAssets, file), path.join(extensionWorkspaceFolder, file), {
                recursive: true,
                force: true,
            });
        });
    }
    // Commit code.
    commitCode(rootWorkspaceFolder, '\\`extensionWorkspaceSrc()\\`');
}
function templatesWorkspaceSrc() {
    // Add `tsconfig.json`.
    fs.writeFileSync(`${templatesWorkspaceFolder}/tsconfig.json`, `{
  "extends": "./tsconfig-paths.json",
  "include": ["../dev/**/*.d.ts", "../dev/.quasar/**/*.d.ts", "./**/*"]
}
`, {
        encoding: 'utf-8',
    });
    // Add `templates` from global `assets`.
    fs.cpSync(`${globalAssets}/Multi-module Extension Template/templates`, `${extensionWorkspaceFolder}/templates`, {
        recursive: true,
    });
    // Add project template.
    const templatesAssets = `${projectAssets}/templates/templates`;
    if (fs.existsSync(templatesAssets)) {
        fs.readdirSync(templatesAssets).forEach((file) => {
            fs.cpSync(path.join(templatesAssets, file), path.join(templatesWorkspaceFolder, file), {
                recursive: true,
                force: true,
            });
        });
    }
    // Commit code.
    commitCode(rootWorkspaceFolder, '\\`templatesWorkspaceSrc()\\`');
}
function devWorkspaceSrc() {
    // Add project template.
    const devAssets = `${projectAssets}/templates/dev`;
    if (fs.existsSync(devAssets)) {
        fs.readdirSync(devAssets).forEach((file) => {
            fs.cpSync(path.join(devAssets, file), path.join(devWorkspaceFolder, file), {
                recursive: true,
                force: true,
            });
        });
    }
    // Add extension config file.
    fs.writeFileSync(`${devWorkspaceFolder}/.${config.extensionId.replace(/-/g, '')}rc.js`, `export default {
  modules: {},
};
`, { encoding: 'utf-8' });
    // Add dependency and add invoke script if `@motinet/quasar-app-extension-mnapp` is detected
    // and the project is not `@motinet/quasar-app-extension-mnapp` itself.
    if (mnappDetected()) {
        extendJsonFile(devPackageJsonFilePath, [
            {
                path: 'scripts.i-mnapp',
                value: 'quasar ext invoke @motinet/mnapp && yarn format --log-level warn',
            },
            {
                path: 'devDependencies.@motinet/quasar-app-extension-mnapp',
                value: config.mnappLocation || packagesVersion['@motinet/quasar-app-extension-mnapp'],
            },
        ]);
    }
    // Commit code.
    commitCode(rootWorkspaceFolder, '\\`devWorkspaceSrc()\\`');
}
// Finish workspaces
function finishRootWorkspace() {
    // Exclude `.yarn`, `dist` from search and `node_modules`, `.git` from compare.
    const extensionsJsonFilePath = path.resolve(`${rootWorkspaceFolder}/.vscode/extensions.json`);
    const settingsJsonFilePath = path.resolve(`${rootWorkspaceFolder}/.vscode/settings.json`);
    extendJsonFile(extensionsJsonFilePath, [
        { path: 'recommendations[]', value: 'moshfeu.compare-folders' },
    ]);
    // Putting `path` in an array to keep it as a single property in JSON file.
    extendJsonFile(settingsJsonFilePath, [
        { path: ['search.exclude', '.yarn'], value: true },
        { path: ['search.exclude', `${config.monorepo ? `${extensionName}/` : ''}dist`], value: true },
    ]);
    extendJsonFile(settingsJsonFilePath, [
        { path: ['compareFolders.excludeFilter'], value: ['node_modules', '.git'] },
        { path: ['compareFolders.ignoreFileNameCase'], value: false },
    ]);
    // Add build scripts.
    extendJsonFile(rootPackageJsonFilePath, [
        {
            path: 'scripts.build',
            value: `${config.monorepo ? `cd ./${extensionName} && ` : ''}yarn tsc && cd ./templates && yarn tsc && cd ../dev && yarn tsc`,
        },
        {
            path: 'scripts.watch',
            value: `${config.monorepo ? `cd ./${extensionName} && ` : ''}yarn tsc --watch`,
        },
        {
            path: 'scripts.buildPaths',
            value: `cd ./${config.monorepo ? `${extensionName}/` : ''}templates && node ./buildPaths.js && yarn prettier --write ./tsconfig-paths.json`,
        },
    ]);
    // Reorder `package.json`.
    reorderJsonFile(rootPackageJsonFilePath);
    // Commit code.
    commitCode(rootWorkspaceFolder, '\\`finishRootWorkspace()\\`');
}
function finishExtensionWorkspace() {
    // Add `typescript`
    extendJsonFile(extensionPackageJsonFilePath, [
        { path: 'devDependencies.typescript', value: packagesVersion['typescript'] },
    ]);
    // Reorder `package.json`.
    reorderJsonFile(extensionPackageJsonFilePath);
    // Commit code.
    commitCode(rootWorkspaceFolder, '\\`finishExtensionWorkspace()\\`');
}
function finishTemplatesWorkspace() {
    // Add `vue-tsc`.
    const packages = [
        'vue-tsc',
        'typescript', // Peer dependency of `vue-tsc`
    ];
    extendJsonFile(templatesPackageJsonFilePath, packages.map((item) => ({
        path: `devDependencies.${item}`,
        value: packagesVersion[item],
    })));
    // Add build script.
    extendJsonFile(templatesPackageJsonFilePath, [
        {
            path: 'scripts.tsc',
            value: 'yarn vue-tsc --noEmit --skipLibCheck',
        },
    ]);
    // Reorder `package.json`.
    reorderJsonFile(templatesPackageJsonFilePath);
    // Commit code.
    commitCode(rootWorkspaceFolder, '\\`finishTemplatesWorkspace()\\`');
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
    // Reorder `package.json`.
    reorderJsonFile(devPackageJsonFilePath);
    // Commit code.
    commitCode(rootWorkspaceFolder, '\\`finishDevWorkspace()\\`');
}
// Install and launch
function installAndLaunch() {
    // Install root workspace packages, build and clean code.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Installing \x1b[47m${config.extensionId}\x1b[0m packages, build and clean code...`);
    if (runYarn) {
        execSync(`cd ${rootWorkspaceFolder.replaceAll(' ', '\\ ')} && yarn && yarn buildPaths && yarn build && yarn clean && cd ./${config.monorepo ? `${extensionName}/` : ''}dev ${mnappDetected() ? `&& yarn i-mnapp ` : ''}&& yarn i-${config.extensionId} && yarn dev`, {
            stdio: 'inherit',
        });
    }
    else {
        console.log(`                   Run \x1b[47mcd ${rootWorkspaceFolder.replaceAll(' ', '\\ ')} && yarn && yarn buildPaths && yarn build && yarn clean && cd ./${config.monorepo ? `${extensionName}/` : ''}dev ${mnappDetected() ? `&& yarn i-mnapp ` : ''}&& yarn i-${config.extensionId} && yarn dev\x1b[0m manually.`);
    }
    // Auto launch
    if (autoLaunch) {
        console.log(' \x1b[32mquasar-generate •\x1b[0m', `Launching \x1b[47m${config.extensionId}\x1b[0m in Visual Studio Code...`);
        execSync(`code ${rootWorkspaceFolder}.replaceAll(' ', '\\ ')`, {
            stdio: 'inherit',
        });
    }
}
// Internal
function mnappDetected() {
    return (!(config.organizationName === 'motinet' && config.extensionId === 'mnapp') &&
        fs.existsSync(path.resolve(`${devWorkspaceFolder}/.mnapprc.js`)));
}
