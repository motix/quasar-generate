import globals from 'globals';
import tseslint from 'typescript-eslint';

import js from '@eslint/js';

tseslint.configs.recommendedTypeChecked.forEach((config) => (config.files = ['**/*.ts']));

export default [
  {
    ignores: ['lib/**/*', 'generated/**/*'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],
    },
  },

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.node,
      },

      parserOptions: {
        project: ['tsconfig.json'],
      },
    },
  },
];
