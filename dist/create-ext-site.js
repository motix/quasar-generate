import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ACCEPT_DEFAULT, cliGhostwriter, DOWN_KEY, WHITESPACE_KEY, } from '@dreamonkey/cli-ghostwriter';
import commitCode from './lib/commit-code.js';
import { monorepoSupportEslintConfig } from './lib/eslint-helpers.js';
import fixCompileTimeYarnPnP from './lib/fix-compile-time-yarn-pnp.js';
import { setupFormatLint } from './lib/format-lint-helpers.js';
import getExtensionInfo from './lib/get-extension-info.js';
import { extendJsonFile } from './lib/json-helpers.js';
import packagesVersion from './lib/packages-version.js';
const project = process.argv[2];
const runYarn = process.argv[3] === '-y' || process.argv[4] === '-y';
const autoLaunch = process.argv[3] === '-l' || process.argv[4] === '-l';
const config = (await import(`../projects/${project}/project.js`)).default;
const projectAssets = `./projects/${project}/assets`;
const rootWorkspaceFolder = `../quasar-generate-output/${config.projectFolder}`;
const extensionWorkspaceFolder = `${rootWorkspaceFolder}/ext`;
const siteWorkspaceFolder = `${rootWorkspaceFolder}/sites/${config.packageName}`;
const rootPackageJsonFilePath = path.resolve(`${rootWorkspaceFolder}/package.json`);
const extensionPackageJsonFilePath = path.resolve(`${extensionWorkspaceFolder}/package.json`);
const sitePackageJsonFilePath = path.resolve(`${siteWorkspaceFolder}/package.json`);
const { extensionPackageName, extensionOrganizationName } = await getExtensionInfo(extensionPackageJsonFilePath);
console.log(' \x1b[32mquasar-generate •\x1b[0m', `Create site \x1b[47m${config.packageName}\x1b[0m for extension \x1b[47m${extensionPackageName}\x1b[0m`);
// Turning on/off features
const f = false;
const commitCodeEnabled = true;
// Create workspaces
f || (await createQuasarProject());
f || setPackageInfo();
f || prepareWorkspaces();
// Fix Yarn PnP for Quasar `dev` and `build`
f ||
    fixCompileTimeYarnPnP({
        targetWorkspaceFolder: siteWorkspaceFolder,
        commitCodeMessage: commitCodeEnabled
            ? `\\\`fixCompileTimeYarnPnP()\\\` for \\\`${config.packageName}\\\``
            : undefined,
    });
// Workspaces formatting and linting
f || formattingAndLinting();
// Workspaces base source code
f || workspaceSrc();
// Finish workspaces
f || finishWorkspace();
// Install and launch
f || installAndLaunch();
// Create workspaces
async function createQuasarProject() {
    // Create Quasar project for `dev` workspace.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Creating Quasar project for \x1b[47m${config.packageName}\x1b[0m...`);
    const answersMap = {
        'What would you like to build?': ACCEPT_DEFAULT, // App with Quasar CLI
        'Project folder': siteWorkspaceFolder,
        'Pick script type': `${DOWN_KEY}`, // Typescript
        'Pick Quasar App CLI variant': ACCEPT_DEFAULT, // Quasar App CLI with Vite
        'Package name': config.packageName,
        'Project product name': config.productName,
        'Project description': config.productDescription,
        'Check the features needed for your project': `${DOWN_KEY}${DOWN_KEY}${WHITESPACE_KEY}`, // Sass, Linting, Pinia
        'Add Prettier for code formatting?': ACCEPT_DEFAULT, // Y
        'Install project dependencies?': `${DOWN_KEY}`, // No
    };
    await cliGhostwriter({
        command: 'yarn create quasar',
        answersMap: answersMap,
        endingMarker: 'Enjoy! - Quasar Team',
    });
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`createQuasarProject()\\\` for \\\`${config.packageName}\\\``);
}
function setPackageInfo() {
    // Set `version` and `author`.
    extendJsonFile(sitePackageJsonFilePath, [
        {
            path: 'version',
            value: config.version,
        },
        {
            path: 'author',
            value: config.author,
        },
    ]);
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`setPackageInfo()\\\` for \\\`${config.packageName}\\\``);
}
function prepareWorkspaces() {
    // Define workspaces.
    extendJsonFile(rootPackageJsonFilePath, [
        {
            path: 'workspaces[]',
            value: `sites/*`,
        },
    ]);
    // Add extension workspace as a dependency in site workspace.
    extendJsonFile(sitePackageJsonFilePath, [
        {
            path: `devDependencies.${extensionPackageName}`,
            value: 'workspace:*',
        },
    ]);
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`prepareWorkspaces()\\\` for \\\`${config.packageName}\\\``);
}
// Workspaces formatting and linting
function formattingAndLinting() {
    // Setup formatting and linting.
    setupFormatLint({ targetWorkspaceFolder: siteWorkspaceFolder });
    // All formatting and some lingting tools were available in root workspace, remove them here.
    fs.rmSync(`${siteWorkspaceFolder}/.vscode`, { recursive: true });
    fs.rmSync(`${siteWorkspaceFolder}/.editorconfig`);
    fs.rmSync(`${siteWorkspaceFolder}/.prettierrc.json`);
    // Add supports for monorepo in `eslint.config.js`.
    monorepoSupportEslintConfig(`${siteWorkspaceFolder}/eslint.config.js`);
    // Add `clean` script.
    extendJsonFile(sitePackageJsonFilePath, [
        {
            path: 'scripts.clean',
            value: 'yarn format --log-level warn && yarn lint --fix',
        },
    ]);
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`formattingAndLinting()\\\` for \\\`${config.packageName}\\\``);
}
// Workspaces base source code
function workspaceSrc() {
    // Change to PascalCase.
    let appvue = fs.readFileSync(`${siteWorkspaceFolder}/src/App.vue`, 'utf-8');
    appvue = appvue.replace('<router-view />', '<RouterView />');
    fs.writeFileSync(`${siteWorkspaceFolder}/src/App.vue`, appvue, 'utf-8');
    // Disable shim.
    let quasarconfigts = fs.readFileSync(`${siteWorkspaceFolder}/quasar.config.ts`, 'utf-8');
    quasarconfigts = quasarconfigts.replace('vueShim: true', 'vueShim: false');
    fs.writeFileSync(`${siteWorkspaceFolder}/quasar.config.ts`, quasarconfigts, 'utf-8');
    // Add extension config file. This could be overriden by project template.
    fs.writeFileSync(`${siteWorkspaceFolder}/.${config.extensionId.replace(/-/g, '')}rc.js`, `export default {
  modules: {},
};
`, 'utf-8');
    // Add shared template.
    const sharedAssets = `./${path.relative(path.resolve('.'), path.resolve(`./projects/${project}`, config.sharedAssets))}`;
    const siteSharedAssets = `${sharedAssets}/templates/site`;
    if (fs.existsSync(siteSharedAssets)) {
        fs.readdirSync(siteSharedAssets).forEach((file) => {
            fs.cpSync(path.join(siteSharedAssets, file), path.join(siteWorkspaceFolder, file), {
                recursive: true,
                force: true,
            });
        });
    }
    // Apply project template.
    const siteProjectAssets = `${projectAssets}/templates/site`;
    if (fs.existsSync(siteProjectAssets)) {
        fs.readdirSync(siteProjectAssets).forEach((file) => {
            fs.cpSync(path.join(siteProjectAssets, file), path.join(siteWorkspaceFolder, file), {
                recursive: true,
                force: true,
            });
        });
    }
    // Add dependency and add invoke script if `@motinet/quasar-app-extension-mnapp` is detected
    // and the current extension is not `@motinet/quasar-app-extension-mnapp` itself.
    if (mnappDetected()) {
        extendJsonFile(sitePackageJsonFilePath, [
            {
                path: 'scripts.i-mnapp',
                value: 'quasar ext invoke @motinet/mnapp && yarn format --log-level warn',
            },
            {
                path: 'devDependencies.@motinet/quasar-app-extension-mnapp',
                value: config.mnappLocation || packagesVersion['@motinet/quasar-app-extension-mnapp'],
            },
        ]);
    }
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`workspaceSrc()\\\` for \\\`${config.packageName}\\\``);
}
// Finish workspaces
function finishWorkspace() {
    // Add build script and extension invoke script.
    extendJsonFile(sitePackageJsonFilePath, [
        {
            path: 'scripts.tsc',
            value: 'yarn vue-tsc --noEmit --skipLibCheck',
        },
        {
            path: `scripts.i-${config.extensionId}`,
            value: `quasar ext invoke @${extensionOrganizationName}/${config.extensionId} && yarn format --log-level warn`,
        },
    ]);
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`finishWorkspace()\\\` for \\\`${config.packageName}\\\``);
}
// Install and launch
function installAndLaunch() {
    // Install site workspace packages and clean code.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Installing \x1b[47m${config.packageName}\x1b[0m packages and clean code...`);
    if (runYarn) {
        execSync(`cd ${siteWorkspaceFolder.replaceAll(' ', '\\ ')} && yarn && yarn clean ${mnappDetected() ? `&& yarn i-mnapp ` : ''}&& yarn i-${config.extensionId} && yarn dev`, {
            stdio: 'inherit',
        });
    }
    else {
        console.log(`                   Run \x1b[47mcd ${siteWorkspaceFolder.replaceAll(' ', '\\ ')} && yarn && yarn clean ${mnappDetected() ? `&& yarn i-mnapp ` : ''}&& yarn i-${config.extensionId} && yarn dev\x1b[0m manually.`);
    }
    // Auto launch
    if (autoLaunch) {
        console.log(' \x1b[32mquasar-generate •\x1b[0m', `Launching \x1b[47m${config.extensionId}\x1b[0m in Visual Studio Code...`);
        execSync(`code ${rootWorkspaceFolder}.replaceAll(' ', '\\ ')`, {
            stdio: 'inherit',
        });
    }
}
// Internal
function mnappDetected() {
    return (!(extensionOrganizationName === 'motinet' && config.extensionId === 'mnapp') &&
        fs.existsSync(path.resolve(`${siteWorkspaceFolder}/.mnapprc.js`)));
}
