import { execSync } from 'child_process';

const autoLaunch = process.argv[2] === '-l';

// Finance

execSync(
  'cd ./functions-finance && yarn add dotenv lodash-es slack && yarn add -D @types/lodash-es',
  {
    stdio: 'inherit',
  },
);

// Health

execSync('cd ./functions-health && yarn add lodash-es && yarn add -D @types/lodash-es', {
  stdio: 'inherit',
});

execSync('rm ./functions-health/src/group.ts', {
  stdio: 'inherit',
});

// Production

execSync('cd ./functions-production && yarn add lodash-es && yarn add -D @types/lodash-es', {
  stdio: 'inherit',
});

// Build and clean codes

execSync('yarn && yarn rebuildFunctions && yarn clean', {
  stdio: 'inherit',
});

if (autoLaunch) {
  execSync('yarn serve', {
    stdio: 'inherit',
  });
}
