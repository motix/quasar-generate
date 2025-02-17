import fs from 'fs';
import path from 'path';
import { extendJsonFile, reduceJsonFileArray } from './json-helpers.js';
export default async function (appRoot) {
    const extensionsJson = path.resolve(`./${appRoot}/.vscode/extensions.json`);
    const settingsJson = path.resolve(`./${appRoot}/.vscode/settings.json`);
    const appPackageJsonFilePath = path.resolve(`./${appRoot}/package.json`);
    // Add `format-imports` to `package.json` and add `import-sorter.json` from `assets`.
    await extendJsonFile(appPackageJsonFilePath, [
        { path: 'devDependencies.format-imports', value: '^4.0.7' },
    ]);
    fs.copyFileSync('./assets/import-sorter.json', `./${appRoot}/import-sorter.json`);
    // Modify .vscode/extensions.json and .vscode/settings.json
    await extendJsonFile(extensionsJson, [
        { path: 'recommendations[]', value: 'rohit-gohri.format-code-action' },
        { path: 'recommendations[]', value: 'dozerg.tsimportsorter' },
    ]);
    // Default setting would often lead to Prettier
    // being run after ESLint and ESLint errors still being present.
    reduceJsonFileArray(settingsJson, [
        {
            path: 'editor.codeActionsOnSave',
            value: 'source.fixAll.eslint',
        },
    ]);
    await extendJsonFile(settingsJson, [
        { path: 'editor.formatOnSave', value: false },
        { path: 'editor.codeActionsOnSave[]', value: 'source.formatDocument' },
        { path: 'editor.codeActionsOnSave[]', value: 'source.fixAll.eslint' },
    ]);
    // Modify `eslint.config.js`.
    let eslintConfigJs = fs.readFileSync(`./${appRoot}/eslint.config.js`, 'utf-8');
    eslintConfigJs = eslintConfigJs.replace("  ...pluginVue.configs[ 'flat/essential' ],", "  ...pluginVue.configs[ 'flat/recommended' ],");
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
    fs.writeFileSync(`./${appRoot}/eslint.config.js`, eslintConfigJs, {
        encoding: 'utf-8',
    });
    // Add `clean` script.
    await extendJsonFile(appPackageJsonFilePath, [
        {
            path: 'scripts.clean',
            value: 'yarn format-imports src && yarn format && yarn lint --fix',
        },
    ]);
}
