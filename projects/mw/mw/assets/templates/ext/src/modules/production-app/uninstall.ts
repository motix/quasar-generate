import { restoreFile } from '../../lib/file-backup.js';
import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    removeIfEmpty: [
      'src/models/production/mapper',
      'src/models/production',
      'src/utils/production',
    ],
  });

  restoreFile(api, 'src/layouts/MainLayout.vue');
});
