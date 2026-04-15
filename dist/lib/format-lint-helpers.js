import fs from 'fs';
import path from 'path';
import { extendJsonFile, reduceJsonFileArray } from './json-helpers.js';
import packagesVersion from './packages-version.js';
import patchTrivagoPrettierPluginSortImports from './patches/patch-trivago-prettier-plugin-sort-imports.js';
const globalAssets = './assets';
// Turning on/off features
const sortImportsEnabled = true;
export function addFormatLintDependencies(packageJsonFilePath, quasar) {
    const packages = [
        'eslint',
        'prettier',
        // `eslint.config.js` specific dependencies
        'globals',
        '@eslint/js',
        '@vue/eslint-config-prettier',
        '@vue/eslint-config-typescript',
        'eslint-plugin-vue', // Peer dependency of `@vue/eslint-config-typescript`
        'vue-eslint-parser', // Peer dependency of `eslint-plugin-vue`
        'typescript', // Peer dependency of `@vue/eslint-config-typescript`
    ];
    if (quasar) {
        packages.push('@quasar/app-vite', 'quasar', // Peer dependency of `@quasar/app-vite`
        'typescript', // Peer dependency of `@quasar/app-vite`
        'vue', // Peer dependency of `@quasar/app-vite`
        'vue-router');
    }
    extendJsonFile(packageJsonFilePath, packages.map((item) => ({
        path: `devDependencies.${item}`,
        value: packagesVersion[item],
    })));
}
export function setupFormatLint(options) {
    const { rootWorkspaceFolder, targetWorkspaceFolder } = options;
    const extensionsJsonFilePath = rootWorkspaceFolder === undefined
        ? undefined
        : path.resolve(`${rootWorkspaceFolder}/.vscode/extensions.json`);
    const settingsJsonFilePath = rootWorkspaceFolder === undefined
        ? undefined
        : path.resolve(`${rootWorkspaceFolder}/.vscode/settings.json`);
    const rootPackageJsonFilePath = rootWorkspaceFolder === undefined
        ? undefined
        : path.resolve(`${rootWorkspaceFolder}/package.json`);
    const targetPackageJsonFilePath = path.resolve(`${targetWorkspaceFolder}/package.json`);
    const dotPrettierrcJsonFilePath = rootWorkspaceFolder === undefined
        ? undefined
        : path.resolve(`${rootWorkspaceFolder}/.prettierrc.json`);
    if (rootWorkspaceFolder !== undefined &&
        extensionsJsonFilePath !== undefined &&
        settingsJsonFilePath != undefined &&
        rootPackageJsonFilePath != undefined &&
        dotPrettierrcJsonFilePath != undefined) {
        // Add IDE extension recommendation and modify formatting settings.
        extendJsonFile(extensionsJsonFilePath, [
            { path: 'recommendations[]', value: 'rohit-gohri.format-code-action' },
        ]);
        // Default setting would often lead to Prettier
        // being run after ESLint and ESLint errors still being present.
        // Calling first ESLint will apply @typescript-eslint/consistent-type-imports
        // before sorting imports with Prettier plugin
        // and second ESLint will fix all errors after Prettier.
        extendJsonFile(settingsJsonFilePath, [
            { path: 'editor.formatOnSave', value: false },
            {
                path: 'editor.codeActionsOnSave',
                value: ['source.fixAll.eslint', 'source.formatDocument', 'source.fixAll.eslint'],
            },
        ]);
        // Add Prettier semi rule.
        extendJsonFile(dotPrettierrcJsonFilePath, [{ path: 'semi', value: true }]);
        if (sortImportsEnabled) {
            // Setup Prettier plugin for sorting imports.
            // Add dependency
            extendJsonFile(rootPackageJsonFilePath, [
                {
                    path: 'devDependencies.@trivago/prettier-plugin-sort-imports',
                    value: packagesVersion['@trivago/prettier-plugin-sort-imports'],
                },
            ]);
            // Add plugin settings
            extendJsonFile(dotPrettierrcJsonFilePath, [
                { path: 'plugins[]', value: '@trivago/prettier-plugin-sort-imports' },
                {
                    path: 'importOrder',
                    value: [
                        '.json$',
                        '.css$',
                        '<BUILTIN_MODULES>',
                        '^@fortawesome',
                        '^@automapper',
                        '^vue',
                        '^pinia$',
                        '^#q-app',
                        '^@quasar',
                        '^quasar',
                        '^firebase',
                        '^@vite',
                        '^vite',
                        '<THIRD_PARTY_MODULES>',
                        '^utils',
                        '^models',
                        '^stores',
                        '^services',
                        '^composables',
                        '^components',
                        '^[@]',
                        '^[.]',
                    ],
                },
                { path: 'importOrderSeparation', value: true },
                { path: 'importOrderSortSpecifiers', value: true },
                { path: 'importOrderCaseInsensitive', value: true },
            ]);
            // Fix Prettier plugin Yarn PnP
            fixPrettierPluginYarnPnP(rootWorkspaceFolder, rootPackageJsonFilePath, dotPrettierrcJsonFilePath);
        }
    }
    // Modify `eslint.config.js`.
    let eslintConfigJs = fs.readFileSync(`${targetWorkspaceFolder}/eslint.config.js`, 'utf-8');
    eslintConfigJs = eslintConfigJs.replace("pluginVue.configs[ 'flat/essential' ],", "pluginVue.configs[ 'flat/recommended' ],");
    eslintConfigJs = eslintConfigJs.replace(`      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' }
      ],`, `      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' }
      ],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],`);
    eslintConfigJs = eslintConfigJs.replace("      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'", `      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

      // alphabetical
      'vue/attributes-order': ['warn', { alphabetical: true }]`);
    fs.writeFileSync(`${targetWorkspaceFolder}/eslint.config.js`, eslintConfigJs, {
        encoding: 'utf-8',
    });
    // Add `clean` script.
    extendJsonFile(targetPackageJsonFilePath, [
        {
            path: 'scripts.clean',
            value: 'yarn format --log-level warn && yarn lint --fix',
        },
    ]);
}
function fixPrettierPluginYarnPnP(rootWorkspaceFolder, rootPackageJsonFilePath, dotPrettierrcJsonFilePath) {
    // Add missing dependency and bundle `@trivago/prettier-plugin-sort-imports`.
    extendJsonFile(rootPackageJsonFilePath, [
        {
            path: 'devDependencies.@vue/compiler-sfc',
            value: packagesVersion['@vue/compiler-sfc'],
        },
        {
            path: 'devDependencies.esbuild',
            value: packagesVersion['esbuild'],
        },
    ]);
    !fs.existsSync(`${rootWorkspaceFolder}/scripts`) &&
        fs.mkdirSync(`${rootWorkspaceFolder}/scripts`, { recursive: true });
    fs.copyFileSync(`${globalAssets}/bundle-prettier-plugin-sort-imports.js`, `${rootWorkspaceFolder}/scripts/bundle-prettier-plugin-sort-imports.js`);
    const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonFilePath, 'utf-8'));
    extendJsonFile(rootPackageJsonFilePath, [
        {
            path: 'scripts.postinstall',
            value: `node scripts/bundle-prettier-plugin-sort-imports.js${packageJson.scripts?.postinstall ? ` && ${packageJson.scripts.postinstall}` : ''}`,
        },
    ]);
    // Replace `@trivago/prettier-plugin-sort-imports` with bundled version.
    reduceJsonFileArray(dotPrettierrcJsonFilePath, [
        { path: 'plugins', value: '@trivago/prettier-plugin-sort-imports' },
    ]);
    extendJsonFile(dotPrettierrcJsonFilePath, [
        { path: 'plugins[]', value: './scripts/prettier-plugin-sort-imports-bundle.js' },
    ]);
    // Ignore bundled file.
    const dotGitignoreFilePath = path.resolve(`${rootWorkspaceFolder}/.gitignore`);
    let dotGitignore = fs.readFileSync(dotGitignoreFilePath, 'utf-8');
    dotGitignore = `${dotGitignore}
# Prettier Bundle
scripts/*bundle.js
`;
    fs.writeFileSync(dotGitignoreFilePath, dotGitignore, { encoding: 'utf-8' });
}
// TODO: Remove.
// This method unplugs `@trivago/prettier-plugin-sort-imports` and its dependencies,
// which causes poor performance in Yarn PnP.
export function fixPrettierPluginYarnPnPUnplug(rootWorkspaceFolder, rootPackageJsonFilePath) {
    // Add missing dependency.
    extendJsonFile(rootPackageJsonFilePath, [
        {
            path: 'devDependencies.@vue/compiler-sfc',
            value: packagesVersion['@vue/compiler-sfc'],
        },
    ]);
    // Unplug `@trivago/prettier-plugin-sort-imports` and its dependencies.
    extendJsonFile(rootPackageJsonFilePath, [
        '@babel/generator',
        '@babel/parser',
        '@babel/traverse',
        '@babel/types',
        '@trivago/prettier-plugin-sort-imports',
        'brace-expansion',
        'javascript-natural-sort',
        'lodash-es',
        'minimatch',
        'parse-imports-exports',
        'parse-statements',
    ].map((item) => ({
        path: `dependenciesMeta.${item}`,
        value: { unplugged: true },
    })));
    // Patch @trivago/prettier-plugin-sort-imports.
    patchTrivagoPrettierPluginSortImports({
        rootWorkspaceFolder: rootWorkspaceFolder,
        targetPackageJsonFilePath: rootPackageJsonFilePath,
    });
    // Convert `.prettierrc.json` to `.prettierrc.js` and use `require`.
    const prettierConfigJs = `import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default {
  singleQuote: true,
  printWidth: 100,
  semi: true,
  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
  importOrder: [
    '.json$',
    '.css$',
    '<BUILTIN_MODULES>',
    '^@fortawesome',
    '^@automapper',
    '^vue',
    '^pinia$',
    '^#q-app',
    '^@quasar',
    '^quasar',
    '^firebase',
    '^@vite',
    '^vite',
    '<THIRD_PARTY_MODULES>',
    '^utils',
    '^models',
    '^stores',
    '^services',
    '^composables',
    '^components',
    '^[@]',
    '^[.]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
};
`;
    fs.writeFileSync(`${rootWorkspaceFolder}/prettier.config.js`, prettierConfigJs, {
        encoding: 'utf-8',
    });
    fs.rmSync(`${rootWorkspaceFolder}/.prettierrc.json`);
}
