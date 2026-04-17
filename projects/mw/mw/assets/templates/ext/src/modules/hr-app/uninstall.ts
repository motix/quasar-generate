import { restoreFile } from '../../lib/file-backup.js';
import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    removeIfEmpty: ['src/models/hr/mapper', 'src/models/hr', 'src/utils/hr'],
  });

  restoreFile(api, 'src/layouts/MainLayout.vue');
});
