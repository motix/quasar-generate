import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

import {
  ACCEPT_DEFAULT,
  cliGhostwriter,
  DOWN_KEY,
  WHITESPACE_KEY,
} from '@dreamonkey/cli-ghostwriter';

import commitCode from './lib/commit-code.js';
import { convertEslintConfigToTsOnly, monorepoSupportEslintConfig } from './lib/eslint-helpers.js';
import fixCompileTimeYarnPnP from './lib/fix-compile-time-yarn-pnp.js';
import { addFormatLintDependencies, setupFormatLint } from './lib/format-lint-helpers.js';
import { extendJsonFile, reduceJsonFile, reorderJsonFile } from './lib/json-helpers.js';
import packagesVersion from './lib/packages-version.js';
import patchQuasarAppVite from './lib/patches/patch-quasar-app-vite.js';
import {
  assets,
  autoLaunch,
  commitCodeEnabled,
  output,
  projects,
  runYarn,
} from './lib/qg-config.js';
import type { CreateExtensionConfig } from './types';

const globalAssets = path.resolve(assets, 'Multi-module Extension Template');
const project = process.argv[2];

if (project === undefined) {
  throw new Error('Please provide a valid `project`');
}

const projectAssets = path.resolve(projects, project, 'assets');
const projectConfigFilePath = path.resolve(projects, project, 'project.js');
const projectConfig = (await import(pathToFileURL(projectConfigFilePath).href))
  .default as CreateExtensionConfig;

if (projectConfig === undefined) {
  throw new Error('Please provide a valid `project.js`');
}

const extensionName = `quasar-app-extension-${projectConfig.extensionId}`;
const extensionPackageName = `@${projectConfig.organizationName}/${extensionName}`;

const root = path.resolve(output, projectConfig.projectFolder);
const monorepoWorkspaceFolder = projectConfig.monorepo ? `${root}/monorepo` : root;
const extensionWorkspaceFolder = projectConfig.monorepo ? `${monorepoWorkspaceFolder}/ext` : root;
const templatesWorkspaceFolder = `${extensionWorkspaceFolder}/templates`;
const devWorkspaceFolder = `${extensionWorkspaceFolder}/dev`;
const monorepoPackageJsonFilePath = path.resolve(`${monorepoWorkspaceFolder}/package.json`);
const extensionPackageJsonFilePath = path.resolve(`${extensionWorkspaceFolder}/package.json`);
const templatesPackageJsonFilePath = path.resolve(`${templatesWorkspaceFolder}/package.json`);
const devPackageJsonFilePath = path.resolve(`${devWorkspaceFolder}/package.json`);

console.log(
  ' \x1b[32mquasar-generate •\x1b[0m',
  `Create extension \x1b[47m${extensionPackageName}\x1b[0m`,
);

// Turning on/off features
const f = false;

// Create workspaces
f || (projectConfig.monorepo && createMonorepoWorkspace());
f || (await createExtensionQuasarProject());
f || createTemplatesWorkspace();
f || (await createDevQuasarProject());
f || setPackagesInfo();
f || prepareWorkspaces();
f || refineGitignore();

// Fix Yarn PnP for Quasar `dev` and `build`
f ||
  fixCompileTimeYarnPnP({
    monorepoWorkspaceFolder,
    targetWorkspaceFolder: devWorkspaceFolder,
    commitCodeMessage: commitCodeEnabled ? '' : undefined,
  });

// Workspaces formatting and linting
f || monorepoWorkspaceFormattingAndLinting();
f || devWorkspaceFormattingAndLinting();
f || templatesWorkspaceFormattingAndLinting(); // `templates` workspace copies files from `dev` workspace, so it needs to be called after `dev` workspace.

// Workspaces base source code
f || monorepoWorkspaceSrc();
f || extensionWorkspaceSrc();
f || templatesWorkspaceSrc();
f || devWorkspaceSrc();

// Finish workspaces
f || finishMonorepoWorkspace();
f || finishExtensionWorkspace();
f || finishTemplatesWorkspace();
f || finishDevWorkspace();

// Install and launch
f || installAndLaunch();

// Create workspaces

function createMonorepoWorkspace() {
  // Create initial `monorepo` workspace.

  console.log(' \x1b[32mquasar-generate •\x1b[0m', `Creating \x1b[33mmonorepo\x1b[0m workspace...`);

  if (!fs.existsSync(monorepoWorkspaceFolder)) {
    fs.mkdirSync(monorepoWorkspaceFolder, { recursive: true });
  }

  fs.writeFileSync(
    monorepoPackageJsonFilePath,
    JSON.stringify(
      {
        name: `${projectConfig.extensionId}-monorepo`,
        type: 'module',
        private: true,
        engines: {
          node: '>= 12.2.0',
          npm: '>= 5.6.0',
          yarn: '>= 1.6.0',
        },
      },
      null,
      2,
    ),
    'utf-8',
  );

  // Init git.

  execSync(`cd ${root.replaceAll(' ', '\\ ')} && git init -q`, {
    stdio: 'inherit',
  });

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`createMonorepoWorkspace()\\`');
}

async function createExtensionQuasarProject() {
  // Create Quasar project for the extension.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    `Creating Quasar project for \x1b[33mextension\x1b[0m workspace...`,
  );

  const answersMap: Record<string, string | undefined> = {
    'What would you like to build?': `${DOWN_KEY}`, // AppExtension (AE) for Quasar CLI
    'Project folder': path.relative('.', extensionWorkspaceFolder),
    'Will you use an organization to publish it?': 'y',
    'Organization name': projectConfig.organizationName,
    'Quasar App Extension ext-id': projectConfig.extensionId,
    'Pick AE code format': ACCEPT_DEFAULT, // ESM
    'Project description': projectConfig.projectDescription,
    'License type': ACCEPT_DEFAULT, // MIT
    'Pick the needed scripts': 'a', // Prompts script, Install script, Uninstall script
  };

  await cliGhostwriter({
    command: 'yarn create quasar',
    answersMap: answersMap,
    endingMarker: 'Enjoy! - Quasar Team',
  });

  // Commit code.

  if (commitCodeEnabled) {
    // Remove the default commit created by Quasar CLI.
    if (!projectConfig.monorepo) {
      execSync(`cd ${root.replaceAll(' ', '\\ ')} && git update-ref -d HEAD`, {
        stdio: 'inherit',
      });
    }

    commitCode(root, '\\`createExtensionQuasarProject()\\`');
  }
}

function createTemplatesWorkspace() {
  // Create initial `templates` workspace.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    `Creating \x1b[33mtemplates\x1b[0m workspace...`,
  );

  fs.mkdirSync(`${templatesWorkspaceFolder}/modules`, { recursive: true });

  fs.writeFileSync(
    `${templatesWorkspaceFolder}/modules/index.ts`,
    `// Dump file to prevent \`lint\` script from reporting errors.
// Remove this file if any code was added.
`,
    'utf-8',
  );

  fs.writeFileSync(
    templatesPackageJsonFilePath,
    JSON.stringify(
      {
        name: `${projectConfig.extensionId}-templates`,
        type: 'module',
        private: true,
      },
      null,
      2,
    ),
    'utf-8',
  );

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`createTemplatesWorkspace()\\`');
}

async function createDevQuasarProject() {
  // Create Quasar project for `dev` workspace.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    'Creating Quasar project for \x1b[33mdev\x1b[0m workspace...',
  );

  const answersMap: Record<string, string | undefined> = {
    'What would you like to build?': ACCEPT_DEFAULT, // App with Quasar CLI
    'Project folder': path.relative('.', devWorkspaceFolder),
    'Pick script type': `${DOWN_KEY}`, // Typescript
    'Pick Quasar App CLI variant': ACCEPT_DEFAULT, // Quasar App CLI with Vite
    'Package name': `${projectConfig.extensionId}-dev`,
    'Project product name': `${projectConfig.extensionId} Dev`,
    'Project description': `Dev for ${projectConfig.extensionId}`,
    'Check the features needed for your project': `${DOWN_KEY}${DOWN_KEY}${WHITESPACE_KEY}`, // Sass, Linting, Pinia
    'Add Prettier for code formatting?': ACCEPT_DEFAULT, // Y
    'Install project dependencies?': `${DOWN_KEY}`, // No
  };

  await cliGhostwriter({
    command: 'yarn create quasar',
    answersMap: answersMap,
    endingMarker: 'Enjoy! - Quasar Team',
  });

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`createDevQuasarProject()\\`');
}

function setPackagesInfo() {
  // Set `version` and `author`.

  extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'version',
      value: projectConfig.version,
    },
    {
      path: 'author',
      value: projectConfig.author,
    },
  ]);

  reduceJsonFile(devPackageJsonFilePath, ['version', 'author']);

  // Set `repository`.

  extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'repository',
      value: {
        type: 'git',
      },
    },
  ]);

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`setPackagesInfo()\\`');
}

function prepareWorkspaces() {
  // Define workspaces.

  extendJsonFile(monorepoPackageJsonFilePath, [
    {
      path: 'workspaces',
      value: projectConfig.monorepo ? ['ext', 'ext/templates', 'ext/dev'] : ['templates', 'dev'],
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

  commitCodeEnabled && commitCode(root, '\\`prepareWorkspaces()\\`');
}

function refineGitignore() {
  const monorepoDotGitignoreFilePath = path.resolve(`${monorepoWorkspaceFolder}/.gitignore`);
  const extensionDotGitignoreFilePath = path.resolve(`${extensionWorkspaceFolder}/.gitignore`);

  // Move `.gitignore` from extension workspace to root.

  if (projectConfig.monorepo) {
    fs.renameSync(extensionDotGitignoreFilePath, monorepoDotGitignoreFilePath);
  }

  // Ignore local .env files, `.yarn` and unignore `.vscode`.

  let dotGitignore = fs.readFileSync(monorepoDotGitignoreFilePath, 'utf-8');

  dotGitignore = `${dotGitignore}
# local .env files
.env.local*

# Yarn PnP
.yarn/cache/
.yarn/sdks/
.yarn/unplugged/
.yarn/install-state.gz
`;
  dotGitignore = dotGitignore.includes('# .vscode')
    ? dotGitignore
    : dotGitignore.replace('.vscode', '# .vscode');

  fs.writeFileSync(monorepoDotGitignoreFilePath, dotGitignore, 'utf-8');

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`refineGitignore()\\`');
}

// Workspaces formatting and linting

function monorepoWorkspaceFormattingAndLinting() {
  // Copy `.vscode`, `.editorconfig`, `.prettierrc.json` and `eslint.config.js` from `dev` workspace.

  fs.cpSync(`${devWorkspaceFolder}/.vscode`, `${monorepoWorkspaceFolder}/.vscode`, {
    recursive: true,
  });
  fs.copyFileSync(
    `${devWorkspaceFolder}/.editorconfig`,
    `${monorepoWorkspaceFolder}/.editorconfig`,
  );
  fs.copyFileSync(
    `${devWorkspaceFolder}/.prettierrc.json`,
    `${monorepoWorkspaceFolder}/.prettierrc.json`,
  );
  fs.copyFileSync(
    `${devWorkspaceFolder}/eslint.config.js`,
    `${monorepoWorkspaceFolder}/eslint.config.js`,
  );

  // Add `.prettierignore` to ignore `.yarn` and `dist` / `lib`.

  fs.writeFileSync(
    `${monorepoWorkspaceFolder}/.prettierignore`,
    `/.yarn
/${projectConfig.monorepo ? 'ext/' : ''}dist${
      projectConfig.monorepo
        ? `
/sites/*/dist`
        : ''
    }
/.pnp.*
`,
    'utf-8',
  );

  // `package.json` formatting scripts will also ignore `sites`.

  projectConfig.monorepo &&
    fs.writeFileSync(
      `${monorepoWorkspaceFolder}/.prettierignore-noneExtension`,
      `/sites
`,
      'utf-8',
    );

  // Add dependencies for formatting and linting.

  addFormatLintDependencies(monorepoPackageJsonFilePath);

  // Setup formatting and linting.

  setupFormatLint({
    monorepoWorkspaceFolder,
    targetWorkspaceFolder: monorepoWorkspaceFolder,
    yarnPnp: true,
  });

  // Add supports for monorepo in `eslint.config.js`.

  monorepoSupportEslintConfig(`${monorepoWorkspaceFolder}/eslint.config.js`);

  // Truncate Vue and HTML specific configurations.

  convertEslintConfigToTsOnly(
    `${monorepoWorkspaceFolder}/eslint.config.js`,
    `'.yarn/', '${projectConfig.monorepo ? 'ext/' : ''}dev/', '${projectConfig.monorepo ? 'ext/' : ''}dist/', '${projectConfig.monorepo ? 'ext/' : ''}templates/'${projectConfig.monorepo ? ", 'sites/'" : ''}, '.pnp.*'`,
  );

  // Add `lint`, `lintf` and `format` scripts and modify `clean` script but they won't work
  // before `dev` and `templates` workspaces formatting and linting are ready.

  reduceJsonFile(monorepoPackageJsonFilePath, ['scripts.clean']);
  extendJsonFile(monorepoPackageJsonFilePath, [
    {
      path: 'scripts.lint',
      value: `eslint -c ./eslint.config.js "./${projectConfig.monorepo ? 'ext/' : ''}src/**/*.{ts,js,cjs,mjs,vue}" && cd ./${projectConfig.monorepo ? 'ext/' : ''}templates && yarn lint && cd ../dev && yarn lint`,
    },
    {
      path: 'scripts.lintf',
      value: `eslint -c ./eslint.config.js "./${projectConfig.monorepo ? 'ext/' : ''}src/**/*.{ts,js,cjs,mjs,vue}" --fix && cd ./${projectConfig.monorepo ? 'ext/' : ''}templates && yarn lint --fix && cd ../dev && yarn lint --fix`,
    },
    {
      path: 'scripts.format',
      value: `prettier --write "**/*.{js,ts,vue,css,scss,html,md,json}" --ignore-path ${projectConfig.monorepo ? 'ext/' : ''}dev/.gitignore --ignore-path .prettierignore${projectConfig.monorepo ? ' --ignore-path .prettierignore-noneExtension' : ''}`,
    },
    {
      path: 'scripts.clean',
      value: 'yarn format --log-level warn && yarn lintf',
    },
  ]);

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`monorepoWorkspaceFormattingAndLinting()\\`');
}

function devWorkspaceFormattingAndLinting() {
  // Setup formatting and linting.

  setupFormatLint({ targetWorkspaceFolder: devWorkspaceFolder, yarnPnp: true });

  // All formatting and some lingting tools were available in `monorepo` workspace, remove them here.

  fs.rmSync(`${devWorkspaceFolder}/.vscode`, { recursive: true });
  fs.rmSync(`${devWorkspaceFolder}/.editorconfig`);
  fs.rmSync(`${devWorkspaceFolder}/.prettierrc.json`);

  // Add supports for monorepo in `eslint.config.js`.

  monorepoSupportEslintConfig(`${devWorkspaceFolder}/eslint.config.js`);

  // Add `clean` script.

  extendJsonFile(devPackageJsonFilePath, [
    {
      path: 'scripts.clean',
      value: 'yarn format --log-level warn && yarn lint --fix',
    },
  ]);

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`devWorkspaceFormattingAndLinting()\\`');
}

function templatesWorkspaceFormattingAndLinting() {
  // Copy `eslint.config.js` from `dev` workspace.

  fs.copyFileSync(
    `${devWorkspaceFolder}/eslint.config.js`,
    `${templatesWorkspaceFolder}/eslint.config.js`,
  );

  // Add dependencies for formatting and linting.

  addFormatLintDependencies(templatesPackageJsonFilePath, true);

  // Add `lint`, `format` and `clean` scripts.

  extendJsonFile(templatesPackageJsonFilePath, [
    {
      path: 'scripts.lint',
      value: 'eslint -c ./eslint.config.js "./modules/**/*.{ts,js,cjs,mjs,vue}"',
    },
    {
      path: 'scripts.format',
      value:
        'prettier --write "**/*.{js,ts,vue,css,scss,html,md,json}" --ignore-path ../dev/.gitignore',
    },
    {
      path: 'scripts.clean',
      value: 'yarn format --log-level warn && yarn lint --fix',
    },
  ]);

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`templatesWorkspaceFormattingAndLinting()\\`');
}

// Workspaces base source code

function monorepoWorkspaceSrc() {
  let dirty = false;

  // Apply project template.

  const monorepoAssets = `${projectAssets}/templates/monorepo`;

  if (fs.existsSync(monorepoAssets)) {
    fs.readdirSync(monorepoAssets).forEach((file) => {
      dirty = true;
      fs.cpSync(path.join(monorepoAssets, file), path.join(monorepoWorkspaceFolder, file), {
        recursive: true,
        force: true,
      });
    });
  }

  // Commit code.

  commitCodeEnabled && dirty && commitCode(root, '\\`monorepoWorkspaceSrc()\\`');
}

function extensionWorkspaceSrc() {
  // Add `tsconfig.json`.

  fs.writeFileSync(
    `${extensionWorkspaceFolder}/tsconfig.json`,
    JSON.stringify(
      {
        extends: './dev/.quasar/tsconfig.json',
        compilerOptions: {
          noEmit: false,
          rootDir: './src',
          outDir: './dist',
          paths: {},
        },
        include: ['./src/**/*.ts'],
        exclude: [],
      },
      null,
      2,
    ),
    'utf-8',
  );

  // Add `src` specific dependencies.

  const packages: (keyof typeof packagesVersion)[] = [
    '@quasar/app-vite',
    'quasar', // Peer dependency of `@quasar/app-vite`
    'vue', // Peer dependency of `@quasar/app-vite`
    'vue-router', // Peer dependency of `@quasar/app-vite`
    'lodash-es',
    '@types/lodash-es',
  ];
  // Quasar extensions run in host environment, so we need to add all dependencies to `dependencies`
  extendJsonFile(
    extensionPackageJsonFilePath,
    packages.map((item) => ({
      path: `dependencies.${item}`,
      value: packagesVersion[item],
    })),
  );

  // Delete `src` folder.

  fs.rmSync(`${extensionWorkspaceFolder}/src`, { recursive: true });

  // Add `src` from global `assets`.

  fs.cpSync(`${globalAssets}/src`, `${extensionWorkspaceFolder}/src`, {
    recursive: true,
  });

  // Patch `@quasar/app-vite`.

  patchQuasarAppVite({
    monorepoWorkspaceFolder,
    targetPackageJsonFilePath: extensionPackageJsonFilePath,
  });

  // Apply project template.

  const extensionAssets = `${projectAssets}/templates/ext`;

  if (fs.existsSync(extensionAssets)) {
    fs.readdirSync(extensionAssets).forEach((file) => {
      fs.cpSync(path.join(extensionAssets, file), path.join(extensionWorkspaceFolder, file), {
        recursive: true,
        force: true,
      });
    });
  }

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`extensionWorkspaceSrc()\\`');
}

function templatesWorkspaceSrc() {
  // Add `templates` from global `assets`.

  fs.cpSync(`${globalAssets}/templates`, `${extensionWorkspaceFolder}/templates`, {
    recursive: true,
  });

  // Apply project template.

  const templatesAssets = `${projectAssets}/templates/templates`;

  if (fs.existsSync(templatesAssets)) {
    fs.readdirSync(templatesAssets).forEach((file) => {
      fs.cpSync(path.join(templatesAssets, file), path.join(templatesWorkspaceFolder, file), {
        recursive: true,
        force: true,
      });
    });

    // Remove dump file as code was added to `templates`
    fs.rmSync(`${templatesWorkspaceFolder}/modules/index.ts`);
  }

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`templatesWorkspaceSrc()\\`');
}

function devWorkspaceSrc() {
  // Change to PascalCase.

  let appvue = fs.readFileSync(`${devWorkspaceFolder}/src/App.vue`, 'utf-8');

  appvue = appvue.replace('<router-view />', '<RouterView />');

  fs.writeFileSync(`${devWorkspaceFolder}/src/App.vue`, appvue, 'utf-8');

  // Disable shim.

  let quasarconfigts = fs.readFileSync(`${devWorkspaceFolder}/quasar.config.ts`, 'utf-8');

  quasarconfigts = quasarconfigts.replace('vueShim: true', 'vueShim: false');

  fs.writeFileSync(`${devWorkspaceFolder}/quasar.config.ts`, quasarconfigts, 'utf-8');

  // Add extension config file. This could be overriden by project template.

  fs.writeFileSync(
    `${devWorkspaceFolder}/.${projectConfig.extensionId.replace(/-/g, '')}rc.js`,
    `export default {
  modules: {},
};
`,
    'utf-8',
  );

  // Apply project template.

  const devAssets = `${projectAssets}/templates/dev`;

  if (fs.existsSync(devAssets)) {
    fs.readdirSync(devAssets).forEach((file) => {
      fs.cpSync(path.join(devAssets, file), path.join(devWorkspaceFolder, file), {
        recursive: true,
        force: true,
      });
    });
  }

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
        value:
          projectConfig.mnappLocation || packagesVersion['@motinet/quasar-app-extension-mnapp'],
      },
    ]);
  }

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`devWorkspaceSrc()\\`');
}

// Finish workspaces

function finishMonorepoWorkspace() {
  // Exclude `.yarn`, `dist` from search and `node_modules`, `.git` from compare.

  const extensionsJsonFilePath = path.resolve(`${monorepoWorkspaceFolder}/.vscode/extensions.json`);
  const settingsJsonFilePath = path.resolve(`${monorepoWorkspaceFolder}/.vscode/settings.json`);

  extendJsonFile(extensionsJsonFilePath, [
    { path: 'recommendations[]', value: 'moshfeu.compare-folders' },
  ]);

  // Putting `path` in an array to keep it as a single property in JSON file.
  extendJsonFile(settingsJsonFilePath, [
    { path: ['search.exclude', '.yarn'], value: true },
    { path: ['search.exclude', `${projectConfig.monorepo ? 'ext/' : ''}dist`], value: true },
  ]);
  extendJsonFile(settingsJsonFilePath, [
    { path: ['compareFolders.excludeFilter'], value: ['node_modules', '.git'] },
    { path: ['compareFolders.ignoreFileNameCase'], value: false },
  ]);

  // Add build scripts.

  extendJsonFile(monorepoPackageJsonFilePath, [
    {
      path: 'scripts.build',
      value: `${projectConfig.monorepo ? 'cd ./ext && ' : ''}yarn tsc && cd ./templates && yarn tsc && cd ../dev && yarn tsc`,
    },
    {
      path: 'scripts.watch',
      value: `${projectConfig.monorepo ? 'cd ./ext && ' : ''}yarn tsc --watch`,
    },
    {
      path: 'scripts.buildPaths',
      value: `cd ./${projectConfig.monorepo ? 'ext/' : ''}templates && node ./buildPaths.js && yarn prettier --write ./tsconfig-paths.json`,
    },
  ]);

  // Reorder `package.json`.

  reorderJsonFile(monorepoPackageJsonFilePath);

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`finishMonorepoWorkspace()\\`');
}

function finishExtensionWorkspace() {
  if (projectConfig.monorepo) {
    // Add `typescript`.

    extendJsonFile(extensionPackageJsonFilePath, [
      { path: 'devDependencies.typescript', value: packagesVersion['typescript'] },
    ]);

    // Reorder `package.json`.

    reorderJsonFile(extensionPackageJsonFilePath);

    // Commit code.

    commitCodeEnabled && commitCode(root, '\\`finishExtensionWorkspace()\\`');
  }
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

  // Reorder `package.json`.

  reorderJsonFile(templatesPackageJsonFilePath);

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`finishTemplatesWorkspace()\\`');
}

function finishDevWorkspace() {
  // Add build script and extension invoke script.

  extendJsonFile(devPackageJsonFilePath, [
    {
      path: 'scripts.tsc',
      value: 'yarn vue-tsc --noEmit --skipLibCheck',
    },
    {
      path: `scripts.i-${projectConfig.extensionId}`,
      value: `quasar ext invoke @${projectConfig.organizationName}/${projectConfig.extensionId} && yarn format --log-level warn`,
    },
  ]);

  // Reorder `package.json`.

  reorderJsonFile(devPackageJsonFilePath);

  // Commit code.

  commitCodeEnabled && commitCode(root, '\\`finishDevWorkspace()\\`');
}

// Install and launch

function installAndLaunch() {
  // Install all workspaces packages, build and clean code.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    `Installing \x1b[47m${projectConfig.extensionId}\x1b[0m packages, build and clean code...`,
  );

  if (runYarn) {
    execSync(
      `cd ${monorepoWorkspaceFolder.replaceAll(' ', '\\ ')} && yarn && yarn buildPaths && yarn build && yarn clean && cd ./${projectConfig.monorepo ? 'ext/' : ''}dev ${mnappDetected() ? `&& yarn i-mnapp ` : ''}&& yarn i-${projectConfig.extensionId} && yarn dev`,
      {
        stdio: 'inherit',
      },
    );
  } else {
    console.log(
      `                   Run \x1b[47mcd ${monorepoWorkspaceFolder.replaceAll(' ', '\\ ')} && yarn && yarn buildPaths && yarn build && yarn clean && cd ./${projectConfig.monorepo ? 'ext/' : ''}dev ${mnappDetected() ? `&& yarn i-mnapp ` : ''}&& yarn i-${projectConfig.extensionId} && yarn dev\x1b[0m manually.`,
    );
  }

  // Auto launch

  if (autoLaunch) {
    console.log(
      ' \x1b[32mquasar-generate •\x1b[0m',
      `Launching \x1b[47m${projectConfig.extensionId}\x1b[0m in Visual Studio Code...`,
    );

    execSync(`code ${monorepoWorkspaceFolder}.replaceAll(' ', '\\ ')`, {
      stdio: 'inherit',
    });
  }
}

// Internal

function mnappDetected() {
  return (
    !(projectConfig.organizationName === 'motinet' && projectConfig.extensionId === 'mnapp') &&
    fs.existsSync(path.resolve(`${devWorkspaceFolder}/.mnapprc.js`))
  );
}
