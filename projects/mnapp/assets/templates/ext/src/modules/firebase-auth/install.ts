import fs from 'fs';

import { defineInstall } from '../index.js';

export default defineInstall(function (api) {
  const userRolesConfig = api.prompts.userRoles as string;
  const roles = userRolesConfig.split(',');
  const userRoles = roles.length > 0 ? `', '${roles.join("', '")}` : '';
  api.renderTemplate('dist', { userRoles });

  api.onExitLog(
    " \x1b[32mfirebase-auth • \x1b[0mPlease add \x1b[33mname: 'MainLayout'\x1b[0m to \x1b[33mMainLayout.vue\x1b[0m record in \x1b[47m\x1b[30m./src/router/routes.ts\x1b[0m.",
  );

  modifyFiles();

  function modifyFiles() {
    if (!fs.existsSync(api.resolve.app('.yarnrc.yml'))) {
      fs.writeFileSync(api.resolve.app('.yarnrc.yml'), '');
    }

    let dotyarnrcyml = fs.readFileSync(api.resolve.app('.yarnrc.yml'), 'utf-8');

    dotyarnrcyml = `${dotyarnrcyml === '' ? '' : dotyarnrcyml.trim() + '\n\n'}packageExtensions:
  '@firebase/auth@*':
    dependencies:
      '@firebase/app': '*'
`;

    fs.writeFileSync(api.resolve.app('.yarnrc.yml'), dotyarnrcyml);
  }
});
