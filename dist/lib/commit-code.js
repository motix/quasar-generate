import { execSync } from 'child_process';
export default function commitCode(projectFolder, message) {
    execSync(`cd ${projectFolder.replaceAll(' ', '\\ ')} && git add . && git commit -q -m "${message}"`, {
        stdio: 'inherit',
    });
}
