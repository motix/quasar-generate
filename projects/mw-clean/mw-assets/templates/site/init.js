import { execSync } from 'child_process';

const autoLaunch = process.argv[2] === '-l';

execSync('yarn && yarn clean && yarn i-mnapp && yarn i-motiwiki-2022-app', {
  stdio: 'inherit',
});

execSync(
  'mv ./src/layouts/MainLayout.vue ./src/layouts/MainLayout_original.vue && mv ./src/layouts/MainLayout.txt ./src/layouts/MainLayout.vue',
  {
    stdio: 'inherit',
  },
);

execSync(
  'mv ./src/pages/IndexPage.vue ./src/pages/IndexPage_original.vue && mv ./src/pages/IndexPage.txt ./src/pages/IndexPage.vue',
  {
    stdio: 'inherit',
  },
);

if (autoLaunch) {
  execSync('yarn devp', {
    stdio: 'inherit',
  });
}
