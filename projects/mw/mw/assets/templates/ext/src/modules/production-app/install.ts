import getExtensionConfig from '../../lib/extension-config.js';
import { backupAndDeleteFile } from '../../lib/file-backup.js';
import { defineInstall } from '../index.js';

export default defineInstall(async function (api) {
  const config = await getExtensionConfig(api.appDir);

  backupAndDeleteFile(api, 'src/layouts/MainLayout.vue');

  api.renderTemplate('dist', { config });
});
