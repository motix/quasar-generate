import { execSync } from 'child_process';

const autoLaunch = process.argv[2] === '-l';

execSync(
  `mv ./ext/templates/package.json ./ext/templates/package.txt && yarn && cd ./ext/dev && yarn i-mnapp && cd ../.. && mv ./ext/templates/package.txt ./ext/templates/package.json && yarn && yarn buildPaths && yarn build && yarn clean && cd ./ext/dev && yarn i-motiwiki-2022-app && cd ../.. && mv ./ext/dev/src/layouts/MainLayout.vue ./ext/dev/src/layouts/MainLayout_original.vue && mv ./ext/dev/src/layouts/MainLayout.txt ./ext/dev/src/layouts/MainLayout.vue && mv ./ext/dev/src/pages/IndexPage.vue ./ext/dev/src/pages/IndexPage_original.vue && mv ./ext/dev/src/pages/IndexPage.txt ./ext/dev/src/pages/IndexPage.vue${autoLaunch ? ' && cd ./ext/dev && yarn devp' : ''}`,
  {
    stdio: 'inherit',
  },
);
