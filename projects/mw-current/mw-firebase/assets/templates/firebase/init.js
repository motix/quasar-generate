import { execSync } from 'child_process';

const autoLaunch = process.argv[2] === '-l';

execSync('yarn && yarn rebuildFunctions && yarn clean', {
  stdio: 'inherit',
});

if (autoLaunch) {
  execSync('yarn serve', {
    stdio: 'inherit',
  });
}
