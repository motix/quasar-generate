import { execSync } from 'child_process';
export default function commitCode(folder, message) {
    execSync(`cd ${folder.replaceAll(' ', '\\ ')} && git add . && git commit -q -m "${message}"`, {
        stdio: 'inherit',
    });
}
