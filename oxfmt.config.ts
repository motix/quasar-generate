import { defineConfig } from "oxfmt";

export default defineConfig({
  $schema: "./node_modules/oxfmt/configuration_schema.json",

  ignorePatterns: [
    "**/node_modules/",
    "/assets/",
    "/dist/",
  ],

  printWidth: 100,
  arrowParens: "avoid",
  bracketSpacing: true,
  bracketSameLine: false,
  htmlWhitespaceSensitivity: "strict",
  semi: true,
  singleQuote: true,
  quoteProps: "as-needed",
  trailingComma: "all",
  useTabs: false,
  vueIndentScriptAndStyle: false,

  sortImports: {
    customGroups: [
      {
        groupName: 'json-files',
        elementNamePattern: ['**/*.json'],
      },
      {
        groupName: '@fortawesome',
        elementNamePattern: ['@fortawesome/*'],
      },
      {
        groupName: '@automapper',
        elementNamePattern: ['@automapper/*'],
      },
      {
        groupName: 'vue',
        elementNamePattern: ['vue', 'vue-*'],
      },
      {
        groupName: 'pinia',
        elementNamePattern: ['pinia'],
      },
      {
        groupName: '#q-app',
        elementNamePattern: ['#q-app/*'],
      },
      {
        groupName: '@quasar',
        elementNamePattern: ['@quasar/*'],
      },
      {
        groupName: 'quasar',
        elementNamePattern: ['quasar'],
      },
      {
        groupName: 'firebase',
        elementNamePattern: ['firebase/*'],
      },
      {
        groupName: 'utils',
        elementNamePattern: ['utils/*'],
      },
      {
        groupName: 'models',
        elementNamePattern: ['models/*'],
      },
      {
        groupName: 'stores',
        elementNamePattern: ['stores/*'],
      },
      {
        groupName: 'services',
        elementNamePattern: ['services/*'],
      },
      {
        groupName: 'composables',
        elementNamePattern: ['composables/*'],
      },
      {
        groupName: 'components',
        elementNamePattern: ['components/*'],
      },
    ],
    groups: [
      'json-files',
      ['side_effect_style', 'style'],

      'type-import',
      'value-builtin',

      '@fortawesome',
      '@automapper',
      'vue',
      'pinia',
      '#q-app',
      '@quasar',
      'quasar',
      'firebase',

      'value-external',

      'utils',
      'models',
      'stores',
      'services',
      'composables',
      'components',

      'type-internal',
      'value-internal',
      ['type-parent', 'type-sibling', 'type-index'],
      ['value-parent', 'value-sibling', 'value-index'],

      'unknown',
    ],
  }
});
