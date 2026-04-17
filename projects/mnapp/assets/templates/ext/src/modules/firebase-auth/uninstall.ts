import fs from 'fs';

import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  modifyFiles();

  api.removeTemplateTree('dist', {
    knownPaths: ['src/models/firebase-auth', 'src/pages/auth'],
  });

  api.onExitLog(
    " \x1b[32mfirebase-auth • \x1b[0mPlease remove \x1b[33mname: 'MainLayout'\x1b[0m from \x1b[33mMainLayout.vue\x1b[0m record in \x1b[47m\x1b[30m./src/router/routes.ts\x1b[0m if no longer needed.",
  );

  function modifyFiles() {
    let yarnrcYml = fs.readFileSync(api.resolve.app('.yarnrc.yml'), 'utf-8');

    yarnrcYml = yarnrcYml.replace(
      `packageExtensions:
  '@firebase/auth@*':
    dependencies:
      '@firebase/app': '*'
`,
      '',
    );

    if (yarnrcYml.trim() === '') {
      fs.rmSync(api.resolve.app('.yarnrc.yml'));
    } else {
      fs.writeFileSync(api.resolve.app('.yarnrc.yml'), `${yarnrcYml.trim()}\n`);
    }
  }
});
