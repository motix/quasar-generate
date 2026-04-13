import { restoreFile } from '../../lib/file-backup.js';
import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree();

  restoreFile(api, 'src/layouts/MainLayout.vue');
  restoreFile(api, 'src/pages/IndexPage.vue');
});
