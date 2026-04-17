import { backupAndDeleteFile } from '../../lib/file-backup.js';
import { defineInstall } from '../index.js';

export default defineInstall(function (api) {
  backupAndDeleteFile(api, 'src/layouts/MainLayout.vue');
  backupAndDeleteFile(api, 'src/pages/IndexPage.vue');

  api.renderTemplate();
});
