import globals from 'globals';

import js from '@eslint/js';

export default [
  {
    ignores: ['functions*/**/*'],
  },

  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.node,
      },
    },
  },
];
