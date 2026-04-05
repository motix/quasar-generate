// import fs from 'fs';
import path from 'path';
import { ACCEPT_DEFAULT, DOWN_KEY, WHITESPACE_KEY, cliGhostwriter, } from '@dreamonkey/cli-ghostwriter';
import commitCode from './lib/commit-code.js';
// import fixCompileTimeYarnPnP from './lib/fix-compile-time-yarn-pnp.js';
// import { extendJsonFile, reduceJsonFile } from './lib/json-helpers.js';
import { extendJsonFile } from './lib/json-helpers.js';
const project = process.argv[2];
// TODO
// const runYarn = process.argv[3] === '-y' || process.argv[4] === '-y';
// const autoLaunch = process.argv[3] === '-l' || process.argv[4] === '-l';
const config = (await import(`../projects/${project}/project.js`)).default;
// const projectAssets = `./projects/${project}/assets`;
const rootWorkspaceFolder = `../quasar-generate-output/${config.projectFolder}`;
const extensionWorkspaceFolder = `${rootWorkspaceFolder}/quasar-app-extension-${config.extensionId}`;
const siteWorkspaceFolder = `${rootWorkspaceFolder}/sites/${config.packageName}`;
const rootPackageJsonFilePath = path.resolve(`${rootWorkspaceFolder}/package.json`);
const extensionPackageJsonFilePath = path.resolve(`${extensionWorkspaceFolder}/package.json`);
const sitePackageJsonFilePath = path.resolve(`${siteWorkspaceFolder}/package.json`);
// const { extensionPackageName, extensionId, extensionOrganizationName } = await getExtensionInfo();
const { extensionPackageName } = await getExtensionInfo();
// Turning on/off functions
const f = false;
// Create workspaces
f && (await createQuasarProject());
f && setPackageInfo();
f || prepareWorkspaces();
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
    commitCode(rootWorkspaceFolder, `\\\`createQuasarProject()\\\` for \\\`${config.packageName}\\\``);
}
function setPackageInfo() {
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
    commitCode(rootWorkspaceFolder, `\\\`setPackageInfo()\\\` for \\\`${config.packageName}\\\``);
}
function prepareWorkspaces() {
    // Define workspaces.
    extendJsonFile(rootPackageJsonFilePath, [
        {
            path: 'workspaces[]',
            value: `sites/${config.packageName}`,
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
    commitCode(rootWorkspaceFolder, `\\\`prepareWorkspaces()\\\` for \\\`${config.packageName}\\\``);
}
// Internal
async function getExtensionInfo() {
    const extensionPackageJson = (await import(extensionPackageJsonFilePath, { with: { type: 'json' } })).default;
    let id = extensionPackageJson.name;
    id = id.substring(id.lastIndexOf('/'));
    id = id.substring('quasar-app-extension-'.length + 1);
    let organizationName = extensionPackageJson.name;
    organizationName = organizationName.substring(1, organizationName.lastIndexOf('/'));
    return {
        extensionPackageName: extensionPackageJson.name,
        extensionId: id,
        extensionOrganizationName: organizationName,
    };
}
