import { execSync } from 'child_process';
import fs from 'fs';

export const refRoot = '../../__MONOREPO__/sites';

export const alias = {
  // firebase/firestore
  'firebase/firestore': ['../functions/src/types/firestore.d.ts'],

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

  // Clean codes

  execSync('yarn clean', { stdio: 'inherit' });
}
