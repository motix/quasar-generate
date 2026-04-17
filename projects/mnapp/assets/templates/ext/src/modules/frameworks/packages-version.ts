export const packagesLatestVersion = {
  // Starter Kit packages
  '@eslint/js': '^10.0.1',
  '@quasar/app-vite': '^2.6.0',
  '@quasar/extras': '^1.18.0',
  '@types/node': '^25.6.0',
  '@vue/eslint-config-prettier': '^10.2.0',
  '@vue/eslint-config-typescript': '^14.7.0',
  autoprefixer: '^10.4.27',
  eslint: '^10.2.0',
  'eslint-plugin-vue': '^10.8.0',
  globals: '^17.5.0',
  pinia: '^3.0.4',
  prettier: '^3.8.3',
  quasar: '^2.19.3',
  typescript: '^5.9.3', // Latest is 6.0.2 but it doesn't satisfy @vue/eslint-config-typescript dependencies request
  // 'vite-plugin-checker' -> Patched by `quasar-generate`, use `quasar-generate` to upgrade
  vue: '^3.5.32',
  'vue-eslint-parser': '^10.4.0',
  'vue-router': '^5.0.4',
  'vue-tsc': '^3.2.6',

  // `quasar-generate` packages
  // '@trivago/prettier-plugin-sort-imports' -> Patched by `quasar-generate`, use `quasar-generate` to upgrade
  '@vue/compiler-sfc': '^3.5.31',
  postcss: '^8.5.8',
  vite: '^8.0.3',

  // Additional packages
  'vue-component-type-helpers': '^3.2.6',
};

export const packagesOriginalVersion = {
  // Starter Kit packages
  '@eslint/js': '^9.39.4',
  '@quasar/app-vite': '^2.5.1',
  '@quasar/extras': '^1.16.4',
  '@types/node': '^22.19.11',
  '@vue/eslint-config-prettier': '^10.2.0',
  '@vue/eslint-config-typescript': '^14.7.0',
  autoprefixer: '^10.4.27',
  eslint: '^9.39.4',
  'eslint-plugin-vue': '^10.8.0',
  globals: '^17.4.0',
  pinia: '^3.0.1',
  prettier: '^3.8.1',
  quasar: '^2.16.0',
  typescript: '^5.9.3',
  // 'vite-plugin-checker' -> Patched by `quasar-generate`, did not upgrade
  vue: '^3.5.22',
  'vue-eslint-parser': '^10.4.0',
  'vue-router': '^5.0.3',
  'vue-tsc': '^3.2.6',

  // `quasar-generate` packages
  // '@trivago/prettier-plugin-sort-imports' -> Patched by `quasar-generate`, did not upgrade
  '@vue/compiler-sfc': '^3.5.31',
  postcss: '^8.5.8',
  vite: '^8.0.3',
};
