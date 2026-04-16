import { execSync } from 'child_process';
import fs from 'fs';

const autoLaunch = process.argv[2] === '-l';

execSync('yarn && cd ./ext/dev && yarn i-mnapp', {
  stdio: 'inherit',
});

const devPackageJson = JSON.parse(fs.readFileSync('./ext/dev/package.json', 'utf-8'));

const templatesDevDependencies = [
  '@automapper/core',
  '@automapper/pojos',
  `@fortawesome/fontawesome-svg-core@${devPackageJson.dependencies['@fortawesome/fontawesome-svg-core']}`,
  `@fortawesome/pro-light-svg-icons@${devPackageJson.dependencies['@fortawesome/pro-light-svg-icons']}`,
  `@fortawesome/pro-solid-svg-icons@${devPackageJson.dependencies['@fortawesome/pro-solid-svg-icons']}`,
  '@types/lodash-es',
  'apexcharts',
  'exceljs',
  'firebase',
  'lodash-es',
  'pinia',
  'vee-validate',
  'vue-markdown-render',
  'yup',
];

execSync(`cd ./ext/templates && yarn add -D ${templatesDevDependencies.join(' ')}`, {
  stdio: 'inherit',
});

fs.copyFileSync('./ext/dev/.yarnrc.yml', './.yarnrc.yml');
fs.copyFileSync('./ext/dev/.env.local-mnapp-fap', './.env.local-mnapp-fap');

let yarnrnYml = fs.readFileSync('./.yarnrc.yml', 'utf-8');

// Make `.env.local-mnapp-fap` optional to avoid error when root workspace is built by Yarn
yarnrnYml = yarnrnYml.replace('.env.local-mnapp-fap', '.env.local-mnapp-fap?');

fs.writeFileSync('./.yarnrc.yml', yarnrnYml, { encoding: 'utf-8' });

execSync('yarn && yarn buildPaths && yarn build && yarn clean', {
  stdio: 'inherit',
});

execSync('cd ./ext/dev && yarn i-motiwiki-2022-app', {
  stdio: 'inherit',
});

execSync(
  'mv ./ext/dev/src/layouts/MainLayout.vue ./ext/dev/src/layouts/MainLayout_original.vue && mv ./ext/dev/src/layouts/MainLayout.txt ./ext/dev/src/layouts/MainLayout.vue',
  {
    stdio: 'inherit',
  },
);

execSync(
  'mv ./ext/dev/src/pages/IndexPage.vue ./ext/dev/src/pages/IndexPage_original.vue && mv ./ext/dev/src/pages/IndexPage.txt ./ext/dev/src/pages/IndexPage.vue',
  {
    stdio: 'inherit',
  },
);

if (autoLaunch) {
  execSync('cd ./ext/dev && yarn devp', {
    stdio: 'inherit',
  });
}
