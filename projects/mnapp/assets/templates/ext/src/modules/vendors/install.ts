import fs from 'fs';

import { defineInstall } from '../index.js';
import packagesVersion from './packages-version.js';

export default defineInstall(function (api) {
  const vendorsConfig = api.prompts.vendors as string;
  const vendors = vendorsConfig.split(',');
  let packages: (keyof typeof packagesVersion)[];

  // Font Awesome Pro, vue-fontawesome
  if (vendors.includes('fap')) {
    packages = [
      '@fortawesome/fontawesome-pro',
      '@fortawesome/fontawesome-svg-core',
      '@fortawesome/free-brands-svg-icons',
      '@fortawesome/pro-solid-svg-icons',
      '@fortawesome/pro-regular-svg-icons',
      '@fortawesome/pro-light-svg-icons',
      '@fortawesome/pro-thin-svg-icons',
      '@fortawesome/pro-duotone-svg-icons',
      '@fortawesome/vue-fontawesome',
    ];
    api.extendPackageJson({
      dependencies: Object.fromEntries(packages.map((item) => [item, packagesVersion[item]])),
    });

    api.renderTemplate('dist-fap');

    modifyFilesFab();
  }

  // axios
  if (vendors.includes('axs')) {
    api.extendPackageJson({
      dependencies: {
        axios: packagesVersion.axios,
      },
    });
  }

  // Lodash
  if (vendors.includes('lds')) {
    api.extendPackageJson({
      dependencies: {
        'lodash-es': packagesVersion['lodash-es'],
      },
      devDependencies: {
        '@types/lodash-es': packagesVersion['@types/lodash-es'],
      },
    });
  }

  // js-guid
  if (vendors.includes('jgd')) {
    api.extendPackageJson({
      dependencies: {
        'js-guid': packagesVersion['js-guid'],
      },
    });
  }

  // AutoMapper TypeScript
  if (vendors.includes('atm')) {
    packages = ['@automapper/core', '@automapper/pojos'];
    api.extendPackageJson({
      dependencies: Object.fromEntries(packages.map((item) => [item, packagesVersion[item]])),
    });
  }

  // vee-validate
  if (vendors.includes('vld')) {
    packages = ['vee-validate', '@vee-validate/yup', 'yup'];
    api.extendPackageJson({
      dependencies: Object.fromEntries(packages.map((item) => [item, packagesVersion[item]])),
    });
  }

  // markdown-it
  if (vendors.includes('mkd')) {
    api.extendPackageJson({
      dependencies: {
        'vue-markdown-render': packagesVersion['vue-markdown-render'],
      },
      devDependencies: {
        '@types/markdown-it': packagesVersion['@types/markdown-it'],
      },
    });
  }

  function modifyFilesFab() {
    if (!fs.existsSync(api.resolve.app('.yarnrc.yml'))) {
      fs.writeFileSync(api.resolve.app('.yarnrc.yml'), '');
    }

    let dotyarnrcyml = fs.readFileSync(api.resolve.app('.yarnrc.yml'), 'utf-8');

    if (!dotyarnrcyml.includes('- .env.local-mnapp-fap')) {
      dotyarnrcyml = `${dotyarnrcyml === '' ? '' : dotyarnrcyml.trim() + '\n\n'}injectEnvironmentFiles:
  - .env.local-mnapp-fap
`;
    }

    dotyarnrcyml = `${dotyarnrcyml.trim()}

npmScopes:
  fortawesome:
    npmAlwaysAuth: true
    npmRegistryServer: 'https://npm.fontawesome.com/'
    npmAuthToken: \${FONTAWESOME_PACKAGE_TOKEN}
  awesome.me:
    npmAlwaysAuth: true
    npmRegistryServer: 'https://npm.fontawesome.com/'
    npmAuthToken: \${FONTAWESOME_PACKAGE_TOKEN}
`;

    fs.writeFileSync(api.resolve.app('.yarnrc.yml'), dotyarnrcyml);

    if (!fs.existsSync(api.resolve.app('.env.local-mnapp-fap'))) {
      fs.writeFileSync(api.resolve.app('.env.local-mnapp-fap'), '');
    }

    const dotenvlocal = fs.readFileSync(api.resolve.app('.env.local-mnapp-fap'), 'utf-8');

    if (!dotenvlocal.includes('FONTAWESOME_PACKAGE_TOKEN')) {
      fs.writeFileSync(
        api.resolve.app('.env.local-mnapp-fap'),
        `${dotenvlocal === '' ? '' : dotenvlocal.trim() + '\n\n'}FONTAWESOME_PACKAGE_TOKEN=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
`,
      );

      console.log(
        ' \x1b[32mvendors       • \x1b[0m\x1b[47m\x1b[30m./.env.local-mnapp-fap\x1b[0m with Font Awesome Pro token \x1b[33mFONTAWESOME_PACKAGE_TOKEN\x1b[0m is missing. The extension could be installed successfully but the process will be terminated at dependencies installation step.',
      );
    }
  }
});
