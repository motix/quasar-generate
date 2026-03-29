import { createRequire } from 'module';

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
