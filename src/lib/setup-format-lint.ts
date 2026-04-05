import fs from 'fs';
import path from 'path';

import { extendJsonFile } from './json-helpers.js';
import packagesVersion from './packages-version.js';
import patchTrivagoPrettierPluginSortImports from './patches/patch-trivago-prettier-plugin-sort-imports.js';

export default function setupFormatLint(options: {
  rootWorkspaceFolder?: string | undefined;
  targetWorkspaceFolder: string;
}) {
  const { rootWorkspaceFolder, targetWorkspaceFolder } = options;

  const extensionsJsonFilePath =
    rootWorkspaceFolder === undefined
      ? undefined
      : path.resolve(`${rootWorkspaceFolder}/.vscode/extensions.json`);
  const settingsJsonFilePath =
    rootWorkspaceFolder === undefined
      ? undefined
      : path.resolve(`${rootWorkspaceFolder}/.vscode/settings.json`);
  const rootPackageJsonFilePath =
    rootWorkspaceFolder === undefined
      ? undefined
      : path.resolve(`${rootWorkspaceFolder}/package.json`);
  const targetPackageJsonFilePath = path.resolve(`${targetWorkspaceFolder}/package.json`);
  const dotPrettierrcJsonFilePath =
    rootWorkspaceFolder === undefined
      ? undefined
      : path.resolve(`${rootWorkspaceFolder}/.prettierrc.json`);

  if (
    rootWorkspaceFolder !== undefined &&
    extensionsJsonFilePath !== undefined &&
    settingsJsonFilePath != undefined &&
    rootPackageJsonFilePath != undefined &&
    dotPrettierrcJsonFilePath != undefined
  ) {
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
    ]);

    // Fix Prettier plugin Yarn PnP
    fixPrettierPluginYarnPnP(rootWorkspaceFolder, rootPackageJsonFilePath);
  }

  // Modify `eslint.config.js`.

  let eslintConfigJs = fs.readFileSync(`${targetWorkspaceFolder}/eslint.config.js`, 'utf-8');

  eslintConfigJs = eslintConfigJs.replace(
    "pluginVue.configs[ 'flat/essential' ],",
    "pluginVue.configs[ 'flat/recommended' ],",
  );

  eslintConfigJs = eslintConfigJs.replace(
    `      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' }
      ],`,
    `      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' }
      ],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],`,
  );

  eslintConfigJs = eslintConfigJs.replace(
    "      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'",
    `      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

      // alphabetical
      'vue/attributes-order': ['warn', { alphabetical: true }]`,
  );

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

function fixPrettierPluginYarnPnP(rootWorkspaceFolder: string, rootPackageJsonFilePath: string) {
  // Add missing dependency.

  extendJsonFile(rootPackageJsonFilePath, [
    {
      path: 'devDependencies.@vue/compiler-sfc',
      value: packagesVersion['@vue/compiler-sfc'],
    },
  ]);

  // Unplug `@trivago/prettier-plugin-sort-imports` and its dependencies.

  extendJsonFile(
    rootPackageJsonFilePath,
    [
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
    })),
  );

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
};
`;

  fs.writeFileSync(`${rootWorkspaceFolder}/prettier.config.js`, prettierConfigJs, {
    encoding: 'utf-8',
  });
  fs.rmSync(`${rootWorkspaceFolder}/.prettierrc.json`);
}
