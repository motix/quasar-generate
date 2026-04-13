import { definePrompts } from '../index.js';

export default definePrompts(function () {
  return [
    {
      name: 'tasksNamespace',
      type: 'input',
      message: '[shared-tasks] Tasks Namespace',
    },
  ];
});
