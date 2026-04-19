import path from 'path';
import commitCodeFn from './commit-code.js';
import { extendJsonFile, reduceJsonFile } from './json-helpers.js';
import packagesVersion from './packages-version.js';
import patchVitePluginChecker from './patches/patch-vite-plugin-checker.js';
export default function fixCompileTimeYarnPnP(options) {
    const { monorepoWorkspaceFolder, targetWorkspaceFolder, commitCodeMessage } = options;
    const monorepoPackageJsonFilePath = monorepoWorkspaceFolder === undefined ? undefined : `${monorepoWorkspaceFolder}/package.json`;
    const targetPackageJsonFilePath = `${targetWorkspaceFolder}/package.json`;
    let packages;
    // Add missing peer dependencies.
    packages = ['postcss', 'vite'];
    extendJsonFile(targetPackageJsonFilePath, packages.map((item) => ({
        path: `devDependencies.${item}`,
        value: packagesVersion[item],
    })));
    // Patch and unplug `vite-plugin-checker`.
    // This will solve the error `TypeError: FlatESLint is not a constructor` of ESLint 10.
    patchVitePluginChecker({ monorepoWorkspaceFolder, targetPackageJsonFilePath });
    // This will solve the error
    // `EROFS: read-only filesystem, rm '/node_modules/vite-plugin-checker/dist/checkers/vueTsc/typescript-vue-tsc'`
    monorepoPackageJsonFilePath !== undefined &&
        extendJsonFile(monorepoPackageJsonFilePath, [
            {
                path: 'dependenciesMeta.vite-plugin-checker',
                value: { unplugged: true },
            },
        ]);
    // Install Yarn editor SDKs.
    monorepoPackageJsonFilePath !== undefined &&
        extendJsonFile(monorepoPackageJsonFilePath, [
            // Everytime editor SDKs related packages are added or removed, update editor SDKs
            {
                path: 'scripts.postinstall',
                value: targetWorkspaceFolder === monorepoWorkspaceFolder // Standalone Quasar app
                    ? 'yarn dlx @yarnpkg/sdks vscode && prettier --write ./.vscode/*.* && quasar prepare'
                    : 'yarn dlx @yarnpkg/sdks vscode && prettier --write ./.vscode/*.*',
            },
        ]);
    // Quasar app as child workspace in monorepo
    if (monorepoWorkspaceFolder !== undefined &&
        monorepoPackageJsonFilePath !== undefined &&
        targetWorkspaceFolder !== monorepoWorkspaceFolder) {
        // Fix `vue-tsc` error with Quasar `$q` object.
        extendJsonFile(monorepoPackageJsonFilePath, [
            {
                path: 'dependencies.vue',
                value: packagesVersion.vue,
            },
        ]);
        // Install Yarn editor SDKs.
        // Adding packages to `monorepo` workspace to support editor SDKs
        packages = ['eslint', 'prettier', 'typescript'];
        extendJsonFile(monorepoPackageJsonFilePath, [
            ...packages.map((item) => ({
                path: `devDependencies.${item}`,
                value: packagesVersion[item],
            })),
        ]);
    }
    if (targetWorkspaceFolder !== monorepoWorkspaceFolder) {
        // Remove `typescript.tsdk` settings in target workspace as it will be added to `monorepo` workspace
        // after the `yarn dlx @yarnpkg/sdks vscode` call.
        const settingsJsonPath = path.resolve(`${targetWorkspaceFolder}/.vscode/settings.json`);
        reduceJsonFile(settingsJsonPath, ['typescript.tsdk']);
    }
    // Commit code.
    commitCodeMessage !== undefined &&
        commitCodeFn(
        // If `monorepoWorkspaceFolder` is not provided, call `git add` and `git commit`
        // on `targetWorkspaceFolder` is sufficient to commit all changes.
        monorepoWorkspaceFolder || targetWorkspaceFolder, commitCodeMessage || '\\`fixCompileTimeYarnPnP()\\`');
}
