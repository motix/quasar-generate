import fs from 'fs';
import path from 'path';
import { extendJsonFile } from './json-helpers.js';
export default function (appRoot) {
    const globalAssets = './assets';
    const extensionsJsonFilePath = path.resolve(`${appRoot}/.vscode/extensions.json`);
    const settingsJsonFilePath = path.resolve(`${appRoot}/.vscode/settings.json`);
    const appPackageJsonFilePath = path.resolve(`${appRoot}/package.json`);
    // Add `format-imports` to `package.json` and add `import-sorter.json` from `assets`.
    extendJsonFile(appPackageJsonFilePath, [
        { path: 'devDependencies.format-imports', value: '^4.0.8' },
        /*
         * TODO: Remove this when format-imports is updated to use a newer version of @vue/compiler-sfc
         * or switched to a different format imports tool.
         */
        // Fix ERR_PACKAGE_PATH_NOT_EXPORTED for entities/decode by forcing
        // format-imports to use a newer version of @vue/compiler-sfc.
        { path: 'resolutions.format-imports/@vue/compiler-sfc', value: '^3.5.0' },
    ]);
    fs.copyFileSync(`${globalAssets}/import-sorter.json`, `${appRoot}/import-sorter.json`);
    // Modify .vscode/extensions.json and .vscode/settings.json
    extendJsonFile(extensionsJsonFilePath, [
        { path: 'recommendations[]', value: 'rohit-gohri.format-code-action' },
        { path: 'recommendations[]', value: 'dozerg.tsimportsorter' },
    ]);
    // Default setting would often lead to Prettier
    // being run after ESLint and ESLint errors still being present.
    // Calling first ESLint will apply @typescript-eslint/consistent-type-imports
    // before sorting imports and second ESLint to fix all errors after Prettier.
    extendJsonFile(settingsJsonFilePath, [
        { path: 'editor.formatOnSave', value: false },
        {
            path: 'editor.codeActionsOnSave',
            value: [
                'source.fixAll.eslint',
                'source.organizeImports.sortImports',
                'source.formatDocument',
                'source.fixAll.eslint',
            ],
        },
    ]);
    // Modify `.prettierrc.json`
    extendJsonFile(path.resolve(`${appRoot}/.prettierrc.json`), [{ path: 'semi', value: true }]);
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
            value: 'yarn format-imports src && yarn format --log-level warn && yarn lint --fix',
        },
    ]);
}
