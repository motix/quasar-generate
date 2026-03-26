import fs from 'fs';
import path from 'path';
import { extendJsonFile } from './json-helpers.js';
import packagesVersion from './packages-version.js';
export default function (appRoot) {
    const extensionsJsonFilePath = path.resolve(`${appRoot}/.vscode/extensions.json`);
    const settingsJsonFilePath = path.resolve(`${appRoot}/.vscode/settings.json`);
    const appPackageJsonFilePath = path.resolve(`${appRoot}/package.json`);
    const prettierrcJsonFilePath = path.resolve(`${appRoot}/.prettierrc.json`);
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
    extendJsonFile(prettierrcJsonFilePath, [{ path: 'semi', value: true }]);
    // Setup Prettier plugin for sorting imports.
    // Add dependency
    extendJsonFile(appPackageJsonFilePath, [
        {
            path: 'devDependencies.@trivago/prettier-plugin-sort-imports',
            value: packagesVersion['@trivago/prettier-plugin-sort-imports'],
        },
    ]);
    // Add plugin settings
    extendJsonFile(prettierrcJsonFilePath, [
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
    ]);
    // Fix Prettier plugin Yarn PnP
    fixPrettierPluginYarnPnP(appRoot, appPackageJsonFilePath);
    // Modify `eslint.config.js`.
    let eslintConfigJs = fs.readFileSync(`${appRoot}/eslint.config.js`, 'utf-8');
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
    fs.writeFileSync(`${appRoot}/eslint.config.js`, eslintConfigJs, {
        encoding: 'utf-8',
    });
    // Add `clean` script.
    extendJsonFile(appPackageJsonFilePath, [
        {
            path: 'scripts.clean',
            value: 'yarn format --log-level warn && yarn lint --fix',
        },
    ]);
}
function fixPrettierPluginYarnPnP(appRoot, appPackageJsonFilePath) {
    // Add missing dependency.
    extendJsonFile(appPackageJsonFilePath, [
        {
            path: 'devDependencies.@vue/compiler-sfc',
            value: packagesVersion['@vue/compiler-sfc'],
        },
    ]);
    // Unplug `@trivago/prettier-plugin-sort-imports` and its dependencies.
    extendJsonFile(appPackageJsonFilePath, [
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
    fs.mkdirSync(`${appRoot}/.yarn/patches`, { recursive: true });
    fs.writeFileSync(`${appRoot}/.yarn/patches/@trivago-prettier-plugin-sort-imports-npm-6.0.2-88f9e213cd.patch`, `diff --git a/lib/src/preprocessors/vue-preprocessor.js b/lib/src/preprocessors/vue-preprocessor.js
index 41b5bc94b0fb8406f74a952e2b9afb01510da617..bae2dffc50c8afc4b1c856e7cd832f4d02dc7f20 100644
--- a/lib/src/preprocessors/vue-preprocessor.js
+++ b/lib/src/preprocessors/vue-preprocessor.js
@@ -1,7 +1,9 @@
+import { createRequire } from 'module';
+const require = createRequire(import.meta.url);
 import { preprocessor } from './preprocessor.js';
 let vueCompilerSfc;
 try {
-    vueCompilerSfc = await import('@vue/compiler-sfc');
+    vueCompilerSfc = require('@vue/compiler-sfc');
 }
 catch {
     // Do not error because the dependency is optional.
`, { encoding: 'utf-8' });
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
};
`;
    fs.writeFileSync(`${appRoot}/prettier.config.js`, prettierConfigJs, { encoding: 'utf-8' });
    fs.rmSync(`${appRoot}/.prettierrc.json`);
}
