import { definePrompts } from '../index.js';

export default definePrompts(function () {
  return [
    {
      name: 'devServerPort',
      type: 'number',
      message: '[app-default] Quasar devServer.port',
      default: 8080,
    },
    {
      name: 'https',
      type: 'confirm',
      message: '[app-default] Use HTTPS?',
      default: false,
    },
    {
      name: 'dark',
      type: 'confirm',
      message: '[app-default] Quasar framework.config.dark',
      default: false,
    },
  ];
});
