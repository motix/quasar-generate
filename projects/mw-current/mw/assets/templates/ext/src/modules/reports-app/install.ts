import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import getExtensionConfig from '../../lib/extension-config.js';
import { backupAndDeleteFile } from '../../lib/file-backup.js';
import { defineInstall } from '../index.js';

export default defineInstall(async function (api) {
  const config = await getExtensionConfig(api.appDir);

  backupAndDeleteFile(api, 'src/layouts/MainLayout.vue');

  api.renderTemplate('dist', { config });

  // api.renderFile won't copy files imediately. Use fs instead.
  fs.copyFileSync(
    path.resolve(
      import.meta.dirname,
      '../../../templates/modules/reports-app/dist-financeUpdate/financeUpdate.js',
    ),
    api.resolve.app('financeUpdate.js'),
  );

  api.extendPackageJson({
    scripts: {
      financeUpdate: 'node financeUpdate.js',
    },
  });

  execSync('yarn financeUpdate', {
    stdio: 'inherit',
  });
});
