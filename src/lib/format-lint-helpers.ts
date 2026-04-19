import fs from 'fs';
import path from 'path';

import { extendJsonFile, reduceJsonFileArray } from './json-helpers.js';
import packagesVersion from './packages-version.js';
import { sortImportsEnabled } from './qg-config.js';

const globalAssets = './assets';

export function addFormatLintDependencies(packageJsonFilePath: string, quasar?: boolean) {
  const packages: (keyof typeof packagesVersion)[] = [
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
    packages.push(
      '@quasar/app-vite',
      'quasar', // Peer dependency of `@quasar/app-vite`
      'typescript', // Peer dependency of `@quasar/app-vite`
      'vue', // Peer dependency of `@quasar/app-vite`
      'vue-router', // Peer dependency of `@quasar/app-vite`
    );
  }

  extendJsonFile(
    packageJsonFilePath,
    packages.map((item) => ({
      path: `devDependencies.${item}`,
      value: packagesVersion[item],
    })),
  );
}

export function setupFormatLint(options: {
  monorepoWorkspaceFolder?: string | undefined;
  targetWorkspaceFolder: string;
  yarnPnp: boolean;
}) {
  const { monorepoWorkspaceFolder, targetWorkspaceFolder, yarnPnp } = options;

  const extensionsJsonFilePath =
    monorepoWorkspaceFolder === undefined
      ? undefined
      : path.resolve(`${monorepoWorkspaceFolder}/.vscode/extensions.json`);
  const settingsJsonFilePath =
    monorepoWorkspaceFolder === undefined
      ? undefined
      : path.resolve(`${monorepoWorkspaceFolder}/.vscode/settings.json`);
  const monorepoPackageJsonFilePath =
    monorepoWorkspaceFolder === undefined
      ? undefined
      : path.resolve(`${monorepoWorkspaceFolder}/package.json`);
  const targetPackageJsonFilePath = path.resolve(`${targetWorkspaceFolder}/package.json`);
  const dotPrettierrcJsonFilePath =
    monorepoWorkspaceFolder === undefined
      ? undefined
      : path.resolve(`${monorepoWorkspaceFolder}/.prettierrc.json`);

  if (
    monorepoWorkspaceFolder !== undefined &&
    extensionsJsonFilePath !== undefined &&
    settingsJsonFilePath != undefined &&
    monorepoPackageJsonFilePath != undefined &&
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

    if (sortImportsEnabled) {
      // Setup Prettier plugin for sorting imports.

      // Add dependency
      extendJsonFile(monorepoPackageJsonFilePath, [
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
      yarnPnp &&
        fixPrettierPluginYarnPnP(
          monorepoWorkspaceFolder,
          monorepoPackageJsonFilePath,
          dotPrettierrcJsonFilePath,
        );
    }
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

  fs.writeFileSync(`${targetWorkspaceFolder}/eslint.config.js`, eslintConfigJs, 'utf-8');

  // Add `clean` script.

  extendJsonFile(targetPackageJsonFilePath, [
    {
      path: 'scripts.clean',
      value: 'yarn format --log-level warn && yarn lint --fix',
    },
  ]);
}

function fixPrettierPluginYarnPnP(
  monorepoWorkspaceFolder: string,
  monorepoPackageJsonFilePath: string,
  dotPrettierrcJsonFilePath: string,
) {
  // Add missing dependency and bundle `@trivago/prettier-plugin-sort-imports`.

  extendJsonFile(monorepoPackageJsonFilePath, [
    {
      path: 'devDependencies.@vue/compiler-sfc',
      value: packagesVersion['@vue/compiler-sfc'],
    },
    {
      path: 'devDependencies.esbuild',
      value: packagesVersion['esbuild'],
    },
  ]);

  !fs.existsSync(`${monorepoWorkspaceFolder}/scripts`) &&
    fs.mkdirSync(`${monorepoWorkspaceFolder}/scripts`, { recursive: true });

  fs.copyFileSync(
    `${globalAssets}/bundle-prettier-plugin-sort-imports.js`,
    `${monorepoWorkspaceFolder}/scripts/bundle-prettier-plugin-sort-imports.js`,
  );

  const packageJson = JSON.parse(fs.readFileSync(monorepoPackageJsonFilePath, 'utf-8'));

  extendJsonFile(monorepoPackageJsonFilePath, [
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

  // Ignore bundled file from git and Prettier.

  const dotGitignoreFilePath = path.resolve(`${monorepoWorkspaceFolder}/.gitignore`);
  let dotGitignore = fs.readFileSync(dotGitignoreFilePath, 'utf-8');

  dotGitignore = `${dotGitignore}
# Prettier bundle
scripts/*bundle.js
`;

  fs.writeFileSync(dotGitignoreFilePath, dotGitignore, 'utf-8');

  let prettierignore = fs.readFileSync(`${monorepoWorkspaceFolder}/.prettierignore`, 'utf-8');

  prettierignore = `${prettierignore}/scripts/*bundle.js
`;

  fs.writeFileSync(`${monorepoWorkspaceFolder}/.prettierignore`, prettierignore, 'utf-8');
}
