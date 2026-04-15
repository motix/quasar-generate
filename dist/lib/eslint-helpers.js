import fs from 'fs';
export function monorepoSupportEslintConfig(eslintConfigJsFilePath) {
    // Since there are multiple `eslint.config.js` and `tsconfig.json` files in the project,
    // we need to enable `projectService` to avoid
    // Error while loading rule '@typescript-eslint/await-thenable':
    // You have used a rule which requires type information,
    // but don't have parserOptions set to generate type information for this file.
    // and set `tsconfigRootDir` for each `eslint.config.js` to avoid
    // Parsing error: No tsconfigRootDir was set, and multiple candidate TSConfigRootDirs are present.
    let eslintConfigJs = fs.readFileSync(eslintConfigJsFilePath, 'utf-8');
    eslintConfigJs = eslintConfigJs.replace("pluginVue.configs[ 'flat/recommended' ],", `pluginVue.configs[ 'flat/recommended' ],

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },`);
    fs.writeFileSync(eslintConfigJsFilePath, eslintConfigJs, {
        encoding: 'utf-8',
    });
}
export function convertEslintConfigToTsOnly(eslintConfigJsFilePath, ignores) {
    let eslintConfigJs = fs.readFileSync(eslintConfigJsFilePath, 'utf-8');
    // Before formated
    eslintConfigJs = eslintConfigJs.replace(`import pluginVue from 'eslint-plugin-vue'
import pluginQuasar from '@quasar/app-vite/eslint'
`, '');
    // After formated
    eslintConfigJs = eslintConfigJs.replace(`import pluginQuasar from '@quasar/app-vite/eslint';

import pluginVue from 'eslint-plugin-vue';
`, '');
    eslintConfigJs = eslintConfigJs.replace(`/**
     * Ignore the following files.
     * Please note that pluginQuasar.configs.recommended() already ignores
     * the "node_modules" folder for you (and all other Quasar project
     * relevant folders and files).
     *
     * ESLint requires "ignores" key to be the only one in this object
     */
    // ignores: []`, `/**
     * ESLint requires "ignores" key to be the only one in this object
     */
    ignores: [${ignores || ''}],`);
    eslintConfigJs = eslintConfigJs.replace(`  pluginQuasar.configs.recommended(),
`, '');
    // Before formated
    eslintConfigJs = eslintConfigJs.replace(`
  /**
   * https://eslint.vuejs.org
   *
   * pluginVue.configs.base
   *   -> Settings and rules to enable correct ESLint parsing.
   * pluginVue.configs[ 'flat/essential']
   *   -> base, plus rules to prevent errors or unintended behavior.
   * pluginVue.configs["flat/strongly-recommended"]
   *   -> Above, plus rules to considerably improve code readability and/or dev experience.
   * pluginVue.configs["flat/recommended"]
   *   -> Above, plus rules to enforce subjective community defaults to ensure consistency.
   */
  pluginVue.configs[ 'flat/recommended' ],
`, '');
    // After formated
    eslintConfigJs = eslintConfigJs.replace(`
  /**
   * https://eslint.vuejs.org
   *
   * pluginVue.configs.base
   *   -> Settings and rules to enable correct ESLint parsing.
   * pluginVue.configs[ 'flat/essential']
   *   -> base, plus rules to prevent errors or unintended behavior.
   * pluginVue.configs["flat/strongly-recommended"]
   *   -> Above, plus rules to considerably improve code readability and/or dev experience.
   * pluginVue.configs["flat/recommended"]
   *   -> Above, plus rules to enforce subjective community defaults to ensure consistency.
   */
  pluginVue.configs['flat/recommended'],
`, '');
    eslintConfigJs = eslintConfigJs.replace("files: ['**/*.ts', '**/*.vue'],", "files: ['**/*.ts'],");
    // Before formated
    eslintConfigJs = eslintConfigJs.replace(`
        ga: 'readonly', // Google Analytics
        cordova: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly', // BEX related
        browser: 'readonly' // BEX related`, '');
    // After formated
    eslintConfigJs = eslintConfigJs.replace(`
        ga: 'readonly', // Google Analytics
        cordova: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly', // BEX related
        browser: 'readonly', // BEX related`, '');
    // Before formated
    eslintConfigJs = eslintConfigJs.replace(`
      // alphabetical
      'vue/attributes-order': ['warn', { alphabetical: true }]
`, '');
    // After formated
    eslintConfigJs = eslintConfigJs.replace(`
      // alphabetical
      'vue/attributes-order': ['warn', { alphabetical: true }],
`, '');
    // Before formated
    eslintConfigJs = eslintConfigJs.replace(`
  {
    files: [ 'src-pwa/custom-service-worker.ts' ],
    languageOptions: {
      globals: {
        ...globals.serviceworker
      }
    }
  },
`, '');
    // After formated
    eslintConfigJs = eslintConfigJs.replace(`
  {
    files: ['src-pwa/custom-service-worker.ts'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
`, '');
    fs.writeFileSync(eslintConfigJsFilePath, eslintConfigJs, {
        encoding: 'utf-8',
    });
}
