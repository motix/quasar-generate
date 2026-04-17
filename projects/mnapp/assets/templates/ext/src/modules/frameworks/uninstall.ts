import fs from 'fs';

import { reduceJsonFile, reduceJsonFileArray } from '../../lib/json-helpers.js';
import { defineUninstall } from '../index.js';
import { packagesOriginalVersion } from './packages-version.js';

export default defineUninstall(function (api) {
  modifyFiles();

  const dependencies: (keyof typeof packagesOriginalVersion)[] = [
    // Restore Starter Kit packages
    '@quasar/extras',
    'pinia',
    'quasar',
    'vue',
    'vue-router',
  ];

  const devDependencies: (keyof typeof packagesOriginalVersion)[] = [
    // Restore Starter Kit packages
    '@eslint/js',
    // '@quasar/app-vite' -> Maybe patched by `quasar-generate`, check before restore
    '@types/node',
    '@vue/eslint-config-prettier',
    '@vue/eslint-config-typescript',
    'autoprefixer',
    'eslint',
    'eslint-plugin-vue',
    'globals',
    'prettier',
    'typescript',
    // 'vite-plugin-checker' -> Patched by `quasar-generate`, did not upgrade
    'vue-eslint-parser',
    'vue-tsc',

    // Upgrade `quasar-generate` packages
    // '@trivago/prettier-plugin-sort-imports' -> Patched by `quasar-generate`, did not upgrade
    '@vue/compiler-sfc',
    'postcss',
    'vite',
  ];

  const packageJson = fs.readFileSync(api.resolve.app('package.json'), 'utf-8');

  if (!packageJson.includes('"@quasar/app-vite": "patch')) {
    devDependencies.push('@quasar/app-vite');
  }

  api.extendJsonFile('package.json', {
    dependencies: Object.fromEntries(
      dependencies.map((item) => [item, packagesOriginalVersion[item]]),
    ),
    devDependencies: Object.fromEntries(
      devDependencies.map((item) => [item, packagesOriginalVersion[item]]),
    ),
  });

  reduceJsonFile(api, 'package.json', ['dependencies.vue-component-type-helpers']);

  function modifyFiles() {
    // [Reverse] Modify `.vscode/extensions.json`.

    reduceJsonFileArray(api, '.vscode/extensions.json', [
      { path: 'recommendations', value: 'aaron-bond.better-comments' },
    ]);

    reduceJsonFile(api, '.vscode/settings.json', ['editor.better-comments.tags']);
  }
});
