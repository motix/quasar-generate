import { restoreFile } from '../../lib/file-backup.js';
import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    removeIfEmpty: ['src/models/finance/mapper', 'src/models/finance', 'src/utils/finance'],
  });

  restoreFile(api, 'src/layouts/MainLayout.vue');
});
