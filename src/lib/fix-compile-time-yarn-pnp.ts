import fs from 'fs';
import path from 'path';

import commitCodeFn from './commit-code.js';
import { extendJsonFile, reduceJsonFile } from './json-helpers.js';
import packagesVersion from './packages-version.js';
import patchVitePluginChecker from './patches/patch-vite-plugin-checker.js';

export default function fixCompileTimeYarnPnP(options: {
  rootWorkspaceFolder?: string | undefined;
  targetWorkspaceFolder: string;
  commitCodeMessage?: string | undefined;
}) {
  const { rootWorkspaceFolder, targetWorkspaceFolder, commitCodeMessage } = options;

  const rootPackageJsonFilePath =
    rootWorkspaceFolder === undefined ? undefined : `${rootWorkspaceFolder}/package.json`;
  const targetPackageJsonFilePath = `${targetWorkspaceFolder}/package.json`;

  let packages: (keyof typeof packagesVersion)[];

  // Add missing peer dependencies.

  packages = ['postcss', 'vite'];
  extendJsonFile(
    targetPackageJsonFilePath,
    packages.map((item) => ({
      path: `devDependencies.${item}`,
      value: packagesVersion[item],
    })),
  );

  // Patch and unplug `vite-plugin-checker`.

  // This will solve the error `TypeError: FlatESLint is not a constructor` of ESLint 10.
  patchVitePluginChecker({ rootWorkspaceFolder, targetPackageJsonFilePath });

  // This will solve the error
  // `EROFS: read-only filesystem, rm '/node_modules/vite-plugin-checker/dist/checkers/vueTsc/typescript-vue-tsc'`
  rootPackageJsonFilePath !== undefined &&
    extendJsonFile(rootPackageJsonFilePath, [
      {
        path: 'dependenciesMeta.vite-plugin-checker',
        value: { unplugged: true },
      },
    ]);

  // Install Yarn editor SDKs.

  rootPackageJsonFilePath !== undefined &&
    extendJsonFile(rootPackageJsonFilePath, [
      // Everytime editor SDKs related packages are added or removed, update editor SDKs
      {
        path: 'scripts.postinstall',
        value:
          targetWorkspaceFolder === rootWorkspaceFolder // Standalone Quasar app
            ? 'yarn dlx @yarnpkg/sdks vscode && prettier --write ./.vscode/*.* && quasar prepare'
            : 'yarn dlx @yarnpkg/sdks vscode && prettier --write ./.vscode/*.*',
      },
    ]);

  // Quasar app as child workspace in monorepo
  if (
    rootWorkspaceFolder !== undefined &&
    rootPackageJsonFilePath !== undefined &&
    targetWorkspaceFolder !== rootWorkspaceFolder
  ) {
    // Fix `vue-tsc` error with Quasar `$q` object.

    extendJsonFile(rootPackageJsonFilePath, [
      {
        path: 'dependencies.vue',
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
  }

  if (targetWorkspaceFolder !== rootWorkspaceFolder) {
    // Remove `typescript.tsdk` settings in target workspace as it will be added to root workspace
    // after the `yarn dlx @yarnpkg/sdks vscode` call.

    const settingsJsonPath = path.resolve(`${targetWorkspaceFolder}/.vscode/settings.json`);
    reduceJsonFile(settingsJsonPath, ['typescript.tsdk']);

    if (rootWorkspaceFolder !== undefined) {
      // Unignore `.vscode` to persist settings for editor SDKs.

      let dotGitignore = fs.readFileSync(`${rootWorkspaceFolder}/.gitignore`, 'utf-8');

      dotGitignore = dotGitignore.includes('# .vscode')
        ? dotGitignore
        : dotGitignore.replace('.vscode', '# .vscode');

      fs.writeFileSync(`${rootWorkspaceFolder}/.gitignore`, dotGitignore, 'utf-8');
    }
  }

  // Commit code.

  commitCodeMessage !== undefined &&
    commitCodeFn(
      // If `rootWorkspaceFolder` is not provided, call `git add` and `git commit`
      // on `targetWorkspaceFolder` is sufficient to commit all changes.
      rootWorkspaceFolder || targetWorkspaceFolder,
      commitCodeMessage || '\\`fixCompileTimeYarnPnP()\\`',
    );
}
