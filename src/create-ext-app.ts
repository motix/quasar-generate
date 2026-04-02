// Notes: extension app (ext app) is an app that uses the extension at `config.projectFolder`.
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
import type { CreateAppConfig } from './types';

const project = process.argv[2];
// TODO
// const runYarn = process.argv[3] === '-y' || process.argv[4] === '-y';
// const autoLaunch = process.argv[3] === '-l' || process.argv[4] === '-l';
const config = (await import(`../projects/${project}/project.js`)).default as CreateAppConfig;
const projectAssets = `./projects/${project}/assets`;
const extensionRoot = `../quasar-generate-output/${config.projectFolder}`;
const extAppRoot = `${extensionRoot}/sites/${config.packageName}`;
const extensionPackageJsonFilePath = path.resolve(`${extensionRoot}/package.json`);
const extAppPackageJsonFilePath = path.resolve(`${extAppRoot}/package.json`);
const { extensionPackageName, extensionId, extensionOrganizationName } = await getExtensionInfo();

// Turning on/off functions
const f = false;

// Create workspaces
f || (await createQuasarProject());
f || setPackageInfo();
f || prepareWorkspaces();

// Fix Yarn PnP for Quasar `dev` and `build`
f ||
  fixCompileTimeYarnPnP(
    extensionRoot,
    extAppRoot,
    true,
    true,
    `\\\`fixCompileTimeYarnPnP()\\\` for \\\`${config.packageName}\\\``,
  );

// Workspaces formatting and linting
f || formattingAndLinting();

// Workspaces base source code
f || projectSrc();

// Finish workspaces
f || finishProject();

// Create workspaces

async function createQuasarProject() {
  // Create Quasar project for `dev` workspace.

  console.log(
    ' \x1b[32mquasar-generate •\x1b[0m',
    `Creating Quasar project for \x1b[47m${config.packageName}\x1b[0m...`,
  );

  const answersMap: Record<string, string | undefined> = {
    'What would you like to build?': ACCEPT_DEFAULT, // App with Quasar CLI
    'Project folder': extAppRoot,
    'Pick script type': `${DOWN_KEY}`, // Typescript
    'Pick Quasar App CLI variant': ACCEPT_DEFAULT, // Quasar App CLI with Vite
    'Package name': config.packageName,
    'Project product name': config.productName,
    'Project description': config.productDescription,
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

  commitCode(extensionRoot, `\\\`createQuasarProject()\\\` for \\\`${config.packageName}\\\``);
}

function setPackageInfo() {
  extendJsonFile(extAppPackageJsonFilePath, [
    {
      path: 'version',
      value: config.version,
    },
    {
      path: 'author',
      value: config.author,
    },
  ]);

  // Commit code.

  commitCode(extensionRoot, `\\\`setPackageInfo()\\\` for \\\`${config.packageName}\\\``);
}

function prepareWorkspaces() {
  // Define workspaces.

  extendJsonFile(extensionPackageJsonFilePath, [
    {
      path: 'workspaces[]',
      value: `sites/${config.packageName}`,
    },
  ]);

  // Add root workspace as a dependency in extension app workspace.

  extendJsonFile(extAppPackageJsonFilePath, [
    {
      path: `devDependencies.${extensionPackageName}`,
      value: 'workspace:*',
    },
  ]);

  // Commit code.

  commitCode(extensionRoot, `\\\`prepareWorkspaces()\\\` for \\\`${config.packageName}\\\``);
}

// Workspaces formatting and linting

function formattingAndLinting() {
  // Setup formatting and linting.

  setupFormatLint(extAppRoot);

  // All formatting and some lingting tools were available in root workspace, remove them here.

  fs.rmSync(`${extAppRoot}/.vscode`, { recursive: true });
  fs.rmSync(`${extAppRoot}/.editorconfig`);
  fs.rmSync(`${extAppRoot}/prettier.config.js`);

  // Remove unplugged settings and Prettier plugin with its patch.

  reduceJsonFile(extAppPackageJsonFilePath, [
    'dependenciesMeta',
    'devDependencies.@trivago/prettier-plugin-sort-imports',
  ]);

  fs.rmSync(`${extAppRoot}/.yarn`, { recursive: true });

  // Since there are multiple `eslint.config.js` and `tsconfig.json` files in the project,
  // we need to set `tsconfigRootDir` for each `eslint.config.js` to avoid
  // Parsing error: No tsconfigRootDir was set, and multiple candidate TSConfigRootDirs are present.

  let eslintConfigJs = fs.readFileSync(`${extAppRoot}/eslint.config.js`, 'utf-8');

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

  fs.writeFileSync(`${extAppRoot}/eslint.config.js`, eslintConfigJs, {
    encoding: 'utf-8',
  });

  // Add `clean` script.

  extendJsonFile(extAppPackageJsonFilePath, [
    {
      path: 'scripts.clean',
      value: 'yarn format --log-level warn && yarn lint --fix',
    },
  ]);

  // Commit code.

  commitCode(extensionRoot, `\\\`formattingAndLinting()\\\` for \\\`${config.packageName}\\\``);
}

// Workspaces base source code

function projectSrc() {
  // Change to PascalCase.

  let appvue = fs.readFileSync(`${extAppRoot}/src/App.vue`, 'utf-8');

  appvue = appvue.replace('<router-view />', '<RouterView />');

  fs.writeFileSync(`${extAppRoot}/src/App.vue`, appvue, 'utf-8');

  // Disable shim.

  let quasarconfigts = fs.readFileSync(`${extAppRoot}/quasar.config.ts`, 'utf-8');

  quasarconfigts = quasarconfigts.replace('vueShim: true', 'vueShim: false');

  fs.writeFileSync(`${extAppRoot}/quasar.config.ts`, quasarconfigts, 'utf-8');

  // Add extension config file.

  fs.writeFileSync(
    `${extAppRoot}/.${extensionId.replace(/-/g, '')}rc.js`,
    `export default {
  modules: {},
};
`,
    { encoding: 'utf-8' },
  );

  // Add shared template.

  const sharedAssets = `./${path.relative(path.resolve('.'), path.resolve(`./projects/${project}`, config.sharedAssets))}`;
  const rootSharedAssets = `${sharedAssets}/templates/root`;

  if (fs.existsSync(rootSharedAssets)) {
    fs.readdirSync(rootSharedAssets).forEach((file) => {
      fs.cpSync(path.join(rootSharedAssets, file), path.join(extAppRoot, file), {
        recursive: true,
        force: true,
      });
    });
  }

  // Add project template.

  const rootProjectAssets = `${projectAssets}/templates/root`;

  if (fs.existsSync(rootProjectAssets)) {
    fs.readdirSync(rootProjectAssets).forEach((file) => {
      fs.cpSync(path.join(rootProjectAssets, file), path.join(extAppRoot, file), {
        recursive: true,
        force: true,
      });
    });
  }

  // Add dependency and add invoke script if `@motinet/quasar-app-extension-mnapp` is detected
  // and the current extension is not `@motinet/quasar-app-extension-mnapp` itself.

  if (
    !(extensionOrganizationName === 'motinet' && extensionId === 'mnapp') &&
    fs.existsSync(path.resolve(`${extAppRoot}/.mnapprc.js`))
  ) {
    extendJsonFile(extAppPackageJsonFilePath, [
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

  commitCode(extensionRoot, `\\\`projectSrc()\\\` for \\\`${config.packageName}\\\``);
}

// Finish workspaces

function finishProject() {
  // Add build script and extension invoke script.

  extendJsonFile(extAppPackageJsonFilePath, [
    {
      path: 'scripts.tsc',
      value: 'yarn vue-tsc --noEmit --skipLibCheck',
    },
    {
      path: `scripts.i-${extensionId}`,
      value: `quasar ext invoke @${extensionOrganizationName}/${extensionId} && yarn format --log-level warn`,
    },
  ]);

  // Commit code.

  commitCode(extensionRoot, `\\\`finishProject()\\\` for \\\`${config.packageName}\\\``);
}

// Internal

async function getExtensionInfo() {
  const extensionPackageJson = (
    await import(extensionPackageJsonFilePath, { with: { type: 'json' } })
  ).default;

  let id = extensionPackageJson.name;

  id = id.substring(id.lastIndexOf('/'));
  id = id.substring('quasar-app-extension-'.length + 1);

  let organizationName = extensionPackageJson.name;

  organizationName = organizationName.substring(1, organizationName.lastIndexOf('/'));

  return {
    extensionPackageName: extensionPackageJson.name,
    extensionId: id,
    extensionOrganizationName: organizationName,
  };
}
