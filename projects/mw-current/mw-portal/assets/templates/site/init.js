import { execSync } from 'child_process';

const autoLaunch = process.argv[2] === '-l';

execSync('yarn && yarn clean && yarn i-mnapp && yarn i-motiwiki-2022-app', {
  stdio: 'inherit',
});

if (autoLaunch) {
  execSync('yarn devp', {
    stdio: 'inherit',
  });
}
