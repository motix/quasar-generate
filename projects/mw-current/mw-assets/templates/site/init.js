import { execSync } from 'child_process';

const autoLaunch = process.argv[2] === '-l';

execSync(
  `yarn && yarn clean && yarn i-mnapp && yarn i-motiwiki-2022-app && mv ./src/pages/IndexPage.vue ./src/pages/IndexPage_original.vue && mv ./src/pages/IndexPage.txt ./src/pages/IndexPage.vue${autoLaunch ? ' && yarn devp' : ''}`,
  {
    stdio: 'inherit',
  },
);
