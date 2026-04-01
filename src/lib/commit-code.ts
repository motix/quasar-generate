import { execSync } from 'child_process';

export default function commitCode(projectFolder: string, message: string) {
  execSync(`cd ${projectFolder} && git add . && git commit -q -m "${message}"`, {
    stdio: 'inherit',
  });
}
