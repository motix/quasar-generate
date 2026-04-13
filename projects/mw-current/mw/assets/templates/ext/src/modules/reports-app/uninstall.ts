import { restoreFile } from '../../lib/file-backup.js';
import { reduceJsonFile } from '../../lib/json-helpers.js';
import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  reduceJsonFile(api, 'package.json', ['scripts.financeUpdate']);

  api.removeTemplateTree('dist-financeUpdate');

  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/composables/reports',
      'src/models/reports',
      'src/services/reports',
      // Added by financeUpdate.js
      'src/composables/finance',
      'src/models/finance',
      'src/models/tasks',
      'src/stores/finance',
      'src/types/slack-api.d.ts',
      'src/utils/finance',
      'src/utils/tasks',
    ],
  });

  restoreFile(api, 'src/layouts/MainLayout.vue');
});
