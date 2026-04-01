import fs from 'fs';
import path from 'path';

import commitCodeFn from './commit-code.js';
import { extendJsonFile, reduceJsonFile } from './json-helpers.js';
import packagesVersion from './packages-version.js';
import patchVitePluginChecker from './patches/patch-vite-plugin-checker.js';

export default function fixCompileTimeYarnPnP(
  rootWorkspaceFolder: string,
  childWorkspaceFolder: string,
  commitCode: boolean,
) {
  const isModorepo = childWorkspaceFolder !== rootWorkspaceFolder;
  const rootPackageJsonFilePath = `${rootWorkspaceFolder}/package.json`;
  const childPackageJsonFilePath = `${childWorkspaceFolder}/package.json`;

  let packages: (keyof typeof packagesVersion)[];

  // Add missing peer dependencies.

  packages = ['postcss', 'vite'];
  extendJsonFile(
    childPackageJsonFilePath,
    packages.map((item) => ({
      path: `devDependencies.${item}`,
      value: packagesVersion[item],
    })),
  );

  // Patch and unplug `vite-plugin-checker`.

  // This will solve the error `TypeError: FlatESLint is not a constructor` of ESLint 10.
  patchVitePluginChecker(rootWorkspaceFolder, childPackageJsonFilePath);

  // This will solve the error
  // `EROFS: read-only filesystem, rm '/node_modules/vite-plugin-checker/dist/checkers/vueTsc/typescript-vue-tsc'`
  extendJsonFile(rootPackageJsonFilePath, [
    {
      path: 'dependenciesMeta',
      value: {
        'vite-plugin-checker': {
          unplugged: true,
        },
      },
    },
  ]);

  // Install Yarn editor SDKs.

  extendJsonFile(rootPackageJsonFilePath, [
    // Everytime editor SDKs related packages are added or removed, update editor SDKs
    {
      path: 'scripts.postinstall',
      value: isModorepo
        ? 'yarn dlx @yarnpkg/sdks vscode && prettier --write ./.vscode/*.*'
        : 'yarn dlx @yarnpkg/sdks vscode && prettier --write ./.vscode/*.* && quasar prepare',
    },
  ]);

  if (isModorepo) {
    // Fix `vue-tsc` error with Quasar `$q` object.

    extendJsonFile(rootPackageJsonFilePath, [
      {
        path: 'devDependencies.vue',
        value: packagesVersion.vue,
      },
    ]);

    // Install Yarn editor SDKs.

    // Adding packages to root workspace to support editor SDKs
    packages = ['eslint', 'prettier', 'typescript'];
    extendJsonFile(rootPackageJsonFilePath, [
      ...packages.map((item) => ({
        path: `devDependencies.${item}`,
        value: packagesVersion[item],
      })),
    ]);

    // Remove `typescript.tsdk` settings in child workspace as it will be added to root workspace
    // after the `yarn dlx @yarnpkg/sdks vscode` call.

    const settingsJsonPath = path.resolve(`${childWorkspaceFolder}/.vscode/settings.json`);
    reduceJsonFile(settingsJsonPath, ['typescript.tsdk']);

    // Unignore `.vscode` to persist settings for editor SDKs.

    let gitignore = fs.readFileSync(`${rootWorkspaceFolder}/.gitignore`, 'utf-8');

    gitignore = gitignore.replace('.vscode', '# .vscode');
    fs.writeFileSync(`${rootWorkspaceFolder}/.gitignore`, gitignore, {
      encoding: 'utf-8',
    });
  }

  // Commit code.

  commitCode && commitCodeFn(rootWorkspaceFolder, '\\`fixCompileTimeYarnPnP()\\`');
}
