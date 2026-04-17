import { definePrompts } from '../index.js';

export default definePrompts(function () {
  return [
    {
      name: 'userRoles',
      type: 'input',
      message: '[firebase-auth] Please specify User Roles other than "admin" and "user".',
      default: '',
    },
  ];
});
