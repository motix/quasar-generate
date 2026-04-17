import fs from 'fs';

import { defineInstall } from '../index.js';
import { packagesLatestVersion } from './packages-version.js';

export default defineInstall(async function (api) {
  const dependencies: (keyof typeof packagesLatestVersion)[] = [
    // Upgrade Starter Kit packages
    '@quasar/extras',
    'pinia',
    'quasar',
    'vue',
    'vue-router',

    // Additional packages
    'vue-component-type-helpers',
  ];

  const devDependencies: (keyof typeof packagesLatestVersion)[] = [
    // Upgrade Starter Kit packages
    '@eslint/js',
    // '@quasar/app-vite' -> Maybe patched by `quasar-generate`, check before upgrade
    '@types/node',
    '@vue/eslint-config-prettier',
    '@vue/eslint-config-typescript',
    'autoprefixer',
    'eslint',
    'eslint-plugin-vue',
    'globals',
    'prettier',
    'typescript',
    // 'vite-plugin-checker' -> Patched by `quasar-generate`, use `quasar-generate` to upgrade
    'vue-eslint-parser',
    'vue-tsc',

    // Upgrade `quasar-generate` packages
    // '@trivago/prettier-plugin-sort-imports' -> Patched by `quasar-generate`, use `quasar-generate` to upgrade
    '@vue/compiler-sfc',
    'postcss',
    'vite',
  ];

  const packageJson = fs.readFileSync(api.resolve.app('package.json'), 'utf-8');

  if (!packageJson.includes('"@quasar/app-vite": "patch')) {
    devDependencies.push('@quasar/app-vite');
  }

  api.extendPackageJson({
    dependencies: Object.fromEntries(
      dependencies.map((item) => [item, packagesLatestVersion[item]]),
    ),
    devDependencies: Object.fromEntries(
      devDependencies.map((item) => [item, packagesLatestVersion[item]]),
    ),
  });

  await modifyFiles();

  async function modifyFiles() {
    // Modify `.vscode/extensions.json`.

    if (!fs.existsSync(api.resolve.app('.vscode/extensions.json'))) {
      fs.mkdirSync(api.resolve.app('.vscode'), { recursive: true });
      fs.writeFileSync(api.resolve.app('.vscode/extensions.json'), '{}');
    }

    const extensionsJson = (
      await import(api.resolve.app('.vscode/extensions.json'), {
        with: { type: 'json' },
      })
    ).default;

    if (!extensionsJson.recommendations?.includes('aaron-bond.better-comments')) {
      api.extendJsonFile('.vscode/extensions.json', {
        recommendations: ['aaron-bond.better-comments'],
      });
    }

    if (!fs.existsSync(api.resolve.app('.vscode/settings.json'))) {
      fs.mkdirSync(api.resolve.app('.vscode'), { recursive: true });
      fs.writeFileSync(api.resolve.app('.vscode/settings.json'), '{}');
    }

    const settingsJson = (
      await import(api.resolve.app('.vscode/settings.json'), {
        with: { type: 'json' },
      })
    ).default;

    if (!settingsJson['editor.better-comments.tags']) {
      api.extendJsonFile('.vscode/settings.json', {
        'editor.better-comments.tags': [
          {
            tag: '•+',
            color: '#000000',
            strikethrough: false,
            underline: false,
            backgroundColor: '#a67216',
            bold: false,
            italic: false,
          },
          {
            tag: '•-',
            color: '#000000',
            strikethrough: true,
            underline: false,
            backgroundColor: '#a67216',
            bold: false,
            italic: false,
          },
          {
            tag: '•!',
            color: '#000000',
            strikethrough: false,
            underline: false,
            backgroundColor: '#a67216',
            bold: false,
            italic: true,
          },
          {
            tag: '!',
            color: '#FF2D00',
            strikethrough: false,
            underline: false,
            backgroundColor: 'transparent',
            bold: false,
            italic: false,
          },
          {
            tag: '?',
            color: '#3498DB',
            strikethrough: false,
            underline: false,
            backgroundColor: 'transparent',
            bold: false,
            italic: false,
          },
          {
            tag: '//',
            color: '#474747',
            strikethrough: true,
            underline: false,
            backgroundColor: 'transparent',
            bold: false,
            italic: false,
          },
          {
            tag: 'todo',
            color: '#FF8C00',
            strikethrough: false,
            underline: false,
            backgroundColor: 'transparent',
            bold: false,
            italic: false,
          },
          {
            tag: '*',
            color: '#98C379',
            strikethrough: false,
            underline: false,
            backgroundColor: 'transparent',
            bold: false,
            italic: false,
          },
        ],
      });
    }
  }
});
