import { execSync } from 'child_process';
import fs from 'fs';

const folders = fs.readdirSync('.');

for (const folder of folders) {
  if (folder.startsWith('functions') && fs.lstatSync(folder).isDirectory()) {
    console.log(
      ' \x1b[32m__PACKAGE_NAME__ •\x1b[0m',
      `Rebuilding codebase in \x1b[47m${folder}\x1b[0m...`,
    );

    execSync(`cd ${folder} && yarn && node refUpdate.js && yarn build`, { stdio: 'inherit' });
  }
}
