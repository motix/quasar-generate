import { definePrompts } from '../index.js';

export default definePrompts(function () {
  return [
    {
      name: 'project',
      type: 'input',
      message: '[firebase] Project',
    },
    {
      name: 'targetName',
      type: 'input',
      message: '[firebase] Target name',
    },
    {
      name: 'siteId',
      type: 'input',
      message: '[firebase] Site ID',
    },
    {
      name: 'authEmulatorPort',
      type: 'input',
      message: '[firebase] emulators.auth.port',
      default: '4001',
    },
    {
      name: 'functionsEmulatorPort',
      type: 'input',
      message: '[firebase] emulators.functions.port',
      default: '5001',
    },
    {
      name: 'firestoreEmulatorPort',
      type: 'input',
      message: '[firebase] emulators.firestore.port',
      default: '6001',
    },
    {
      name: 'storageEmulatorPort',
      type: 'input',
      message: '[firebase] emulators.storage.port',
      default: '2001',
    },
  ];
});
