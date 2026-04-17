import fs from 'fs';

import { reduceJsonFile } from '../../lib/json-helpers.js';
import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  const vendorsConfig = api.prompts.vendors as string;
  const vendors = vendorsConfig.split(',');

  // Font Awesome Pro, vue-fontawesome
  if (vendors.includes('fap')) {
    modifyFilesFab();
  }

  api.removeTemplateTree('dist-fap');

  api.onExitLog(
    ' \x1b[32mvendors       • \x1b[0mPlease remove \x1b[33mFONTAWESOME_PACKAGE_TOKEN\x1b[0m from \x1b[47m\x1b[30m./.env.local-mnapp-fap\x1b[0m if no longer needed.',
  );

  reduceJsonFile(api, 'package.json', [
    // Font Awesome Pro, vue-fontawesome
    'dependencies.@fortawesome/fontawesome-pro',
    'dependencies.@fortawesome/fontawesome-svg-core',
    'dependencies.@fortawesome/free-brands-svg-icons',
    'dependencies.@fortawesome/pro-solid-svg-icons',
    'dependencies.@fortawesome/pro-regular-svg-icons',
    'dependencies.@fortawesome/pro-light-svg-icons',
    'dependencies.@fortawesome/pro-thin-svg-icons',
    'dependencies.@fortawesome/pro-duotone-svg-icons',
    'dependencies.@fortawesome/vue-fontawesome',

    // axios
    'dependencies.axios',

    // Lodash
    'dependencies.lodash-es',
    'devDependencies.@types/lodash-es',

    // js-guid
    'dependencies.js-guid',

    // AutoMapper TypeScript
    'dependencies.@automapper/core',
    'dependencies.@automapper/pojos',

    // vee-validate
    'dependencies.vee-validate',
    'dependencies.@vee-validate/yup',
    'dependencies.yup',

    // markdown-it
    'dependencies.vue-markdown-render',
    'devDependencies.@types/markdown-it',
  ]);

  function modifyFilesFab() {
    let yarnrcYml = fs.readFileSync(api.resolve.app('.yarnrc.yml'), 'utf-8');

    yarnrcYml = yarnrcYml.replace(
      `npmScopes:
  fortawesome:
    npmAlwaysAuth: true
    npmRegistryServer: 'https://npm.fontawesome.com/'
    npmAuthToken: \${FONTAWESOME_PACKAGE_TOKEN}
  awesome.me:
    npmAlwaysAuth: true
    npmRegistryServer: 'https://npm.fontawesome.com/'
    npmAuthToken: \${FONTAWESOME_PACKAGE_TOKEN}
`,
      '',
    );

    if (
      yarnrcYml.trim() ===
      `injectEnvironmentFiles:
  - .env.local-mnapp-fap`
    ) {
      fs.rmSync(api.resolve.app('.yarnrc.yml'));
    } else {
      fs.writeFileSync(api.resolve.app('.yarnrc.yml'), `${yarnrcYml.trim()}\n`);
    }
  }
});
