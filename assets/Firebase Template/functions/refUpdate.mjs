import { execSync } from 'child_process';
import fs from 'fs';

import alias from '../functions/alias.mjs';

if (fs.existsSync('./src/ref')) {
  fs.rmSync('./src/ref', { recursive: true });
}

fs.mkdirSync('./src/ref');

// TSConfig `paths`

const tsconfigJson = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf-8'));

tsconfigJson.compilerOptions.paths = {
  ...alias,
};

fs.writeFileSync('./tsconfig.json', JSON.stringify(tsconfigJson, null, 2));

// Format codes

execSync('npx prettier --write tsconfig.json', { stdio: 'inherit' });
execSync('yarn clean', { stdio: 'inherit' });
