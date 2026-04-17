import { execSync } from 'child_process';
import fs from 'fs';

const autoLaunch = process.argv[2] === '-l';

execSync('npm pkg set repository.url="https://github.com/motix/quasar-app-extension-mnapp"', {
  stdio: 'inherit',
});

execSync('yarn add dotenv firebase', {
  stdio: 'inherit',
});

const templatesDevDependencies = [
  '@automapper/core',
  '@automapper/pojos',
  '@types/file-saver',
  '@vee-validate/yup',
  'apexcharts',
  'exceljs',
  'file-saver',
  'firebase',
  'lodash-es',
  'pinia',
  'slack',
  'slack-message-parser',
  'vee-validate',
  'vue-component-type-helpers',
  'vue-tsc',
  'vue3-apexcharts',
  'yup',
];

execSync(
  `cd ./templates && yarn add -D ${templatesDevDependencies.join(' ')} && yarn remove @types/lodash-es && yarn add -D @types/lodash-es`,
  {
    stdio: 'inherit',
  },
);

execSync('yarn && yarn buildPaths && yarn build && yarn clean', {
  stdio: 'inherit',
});

execSync('cd ./dev && yarn i-mnapp', {
  stdio: 'inherit',
});

execSync('yarn buildPaths', {
  stdio: 'inherit',
});

fs.copyFileSync('./dev/.yarnrc.yml', './.yarnrc.yml');
fs.copyFileSync('./dev/.env.local-mnapp-fap', './.env.local-mnapp-fap');

let yarnrnYml = fs.readFileSync('./.yarnrc.yml', 'utf-8');

// Make `.env.local-mnapp-fap` optional to avoid error when root workspace is built by Yarn
yarnrnYml = yarnrnYml.replace('.env.local-mnapp-fap', '.env.local-mnapp-fap?');

fs.writeFileSync('./.yarnrc.yml', yarnrnYml, 'utf-8');

execSync('mv ./dev/src/boot/app.txt ./dev/src/boot/app.ts', {
  stdio: 'inherit',
});

execSync(
  'mv ./dev/src/components/ExampleComponent.vue ./dev/src/components/ExampleComponent_original.vue && mv ./dev/src/components/ExampleComponent.txt ./dev/src/components/ExampleComponent.vue',
  {
    stdio: 'inherit',
  },
);

execSync(
  'mv ./dev/src/layouts/MainLayout.vue ./dev/src/layouts/MainLayout_original.vue && mv ./dev/src/layouts/MainLayout.txt ./dev/src/layouts/MainLayout.vue',
  {
    stdio: 'inherit',
  },
);

let quasarConfigTs = fs.readFileSync('./dev/quasar.config.ts', 'utf-8');

quasarConfigTs = quasarConfigTs.replace('boot: []', "boot: ['app.ts']");

fs.writeFileSync('./dev/quasar.config.ts', quasarConfigTs, 'utf-8');

if (autoLaunch) {
  execSync('cd ./dev && yarn devp', {
    stdio: 'inherit',
  });
}
