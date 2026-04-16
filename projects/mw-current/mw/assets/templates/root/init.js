import { execSync } from 'child_process';
import fs from 'fs';

const autoLaunch = process.argv[2] === '-l';

execSync('mv ./ext/templates/package.json ./ext/templates/package.txt && yarn', {
  stdio: 'inherit',
});

execSync('cd ./ext/dev && yarn i-mnapp', {
  stdio: 'inherit',
});

fs.copyFileSync('./ext/dev/.yarnrc.yml', './.yarnrc.yml');
fs.copyFileSync('./ext/dev/.env.local-mnapp-fap', './.env.local-mnapp-fap');

let yarnrnYml = fs.readFileSync('./.yarnrc.yml', 'utf-8');

// Make `.env.local-mnapp-fap` optional to avoid error when root workspace is built by Yarn
yarnrnYml = yarnrnYml.replace('.env.local-mnapp-fap', '.env.local-mnapp-fap?');

fs.writeFileSync('./.yarnrc.yml', yarnrnYml, { encoding: 'utf-8' });

execSync(
  'mv ./ext/templates/package.txt ./ext/templates/package.json && yarn && yarn buildPaths && yarn build && yarn clean',
  {
    stdio: 'inherit',
  },
);

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
