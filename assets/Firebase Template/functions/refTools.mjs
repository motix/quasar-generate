import { execSync } from 'child_process';
import fs from 'fs';

export const refRoot = '../..';

export const alias = {
  // firebase/firestore
  'firebase/firestore': ['./node_modules/firebase-admin/lib/firestore/index.d.ts'],

  // utils
  'utils/*': [
    '../functions/src/ref/utils/*',
    '../functions/src/utils/*',
    './src/ref/utils/*',
    './src/utils/*',
  ],

  // models
  'models/*': [
    '../functions/src/ref/models/*',
    '../functions/src/models/*',
    './src/ref/models/*',
    './src/models/*',
  ],
};

export function refPrepare() {
  if (fs.existsSync('./src/ref')) {
    fs.rmSync('./src/ref', { recursive: true });
  }

  fs.mkdirSync('./src/ref');

  if (fs.existsSync('./lib')) {
    fs.rmSync('./lib', { recursive: true });
  }
}

export function refFinish(mergedAlias) {
  // TSConfig `paths`

  const tsconfigJson = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf-8'));

  tsconfigJson.compilerOptions.paths = {
    ...mergedAlias,
  };

  fs.writeFileSync('./tsconfig.json', JSON.stringify(tsconfigJson, null, 2));

  // Format codes

  execSync('npx prettier --write tsconfig.json --log-level warn', { stdio: 'inherit' });
  execSync('yarn clean', { stdio: 'inherit' });
}
