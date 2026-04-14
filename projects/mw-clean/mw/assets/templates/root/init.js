import { execSync } from 'child_process';

const autoLaunch = process.argv[2] === '-l';

execSync('yarn && yarn buildPaths && yarn build && yarn clean', {
  stdio: 'inherit',
});

execSync('cd ./ext/dev && yarn i-mnapp && yarn i-motiwiki-2022-app', {
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
