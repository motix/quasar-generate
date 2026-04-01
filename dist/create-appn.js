// import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ACCEPT_DEFAULT, DOWN_KEY, WHITESPACE_KEY, cliGhostwriter, } from '@dreamonkey/cli-ghostwriter';
import commitCode from './lib/commit-code.js';
// import packagesVersion from './lib/packages-version.js';
import fixCompileTimeYarnPnP from './lib/fix-compile-time-yarn-pnp.js';
import setupFormatLint from './lib/format-lintn.js';
// import { extendJsonFile, reduceJsonFile } from './lib/json-helpers.js';
import { extendJsonFile } from './lib/json-helpers.js';
import packagesVersion from './lib/packages-version.js';
import patchQuasarAppVite from './lib/patches/patch-quasar-app-vite.js';
// const globalAssets = './assetsn';
const project = process.argv[2];
// const runYarn = process.argv[3] === '-y' || process.argv[4] === '-y';
// const autoLaunch = process.argv[3] === '-l' || process.argv[4] === '-l';
const config = (await import(`../projects/${project}/project.js`)).default;
const projectAssets = `./projects/${project}/assets`;
const appRoot = `../quasar-generate-output/${config.projectFolder}`;
const packageJsonFilePath = path.resolve(`${appRoot}/package.json`);
const extensionsJsonFilePath = path.resolve(`${appRoot}/.vscode/extensions.json`);
const settingsJsonFilePath = path.resolve(`${appRoot}/.vscode/settings.json`);
// Turning on/off functions
const f = false;
f || (await createQuasarProject());
f || setPackageInfo();
// After this fix, Quasar `dev` and `build` will always work with no error in `dev` workspace.
f || fixCompileTimeYarnPnP(appRoot, appRoot, true);
f || formattingAndLinting();
f || projectSrc();
f || finishProject();
async function createQuasarProject() {
    // Create Quasar project for the app.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Creating Quasar project for \x1b[47m${config.packageName}\x1b[0m...`);
    const answersMap = {
        'What would you like to build?': ACCEPT_DEFAULT, // App with Quasar CLI
        'Project folder': appRoot,
        'Pick script type': `${DOWN_KEY}`, // Typescript
        'Pick Quasar App CLI variant': ACCEPT_DEFAULT, // Quasar App CLI with Vite
        'Package name': config.packageName,
        'Project product name': config.productName,
        'Project description': config.productDescription,
        'Pick a Vue component style': ACCEPT_DEFAULT, // Composition API with <script setup>
        'Pick your CSS preprocessor': ACCEPT_DEFAULT, // Sass with SCSS syntax
        'Check the features needed for your project': `${DOWN_KEY}${WHITESPACE_KEY}`, // Linting, Pinia
        'Add Prettier for code formatting?': ACCEPT_DEFAULT, // Y
        'Install project dependencies?': `${DOWN_KEY}`, // No
    };
    await cliGhostwriter({
        command: 'yarn create quasar',
        answersMap,
        endingMarker: 'Enjoy! - Quasar Team',
    });
}
function setPackageInfo() {
    extendJsonFile(packageJsonFilePath, [
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
    commitCode(appRoot, '\\`setPackagesInfo()\\`');
}
function formattingAndLinting() {
    // Add `.prettierignore` to ignore `.yarn`.
    fs.writeFileSync(`${appRoot}/.prettierignore`, `/.yarn
  .pnp.*
  `, { encoding: 'utf-8' });
    // Setup formatting and linting.
    setupFormatLint(appRoot);
    // Update `format` script.
    extendJsonFile(packageJsonFilePath, [
        {
            path: 'scripts.format',
            value: 'prettier --write "**/*.{js,ts,vue,scss,html,md,json}" --ignore-path .gitignore --ignore-path .prettierignore',
        },
    ]);
    // Commit code.
    commitCode(appRoot, '\\`formattingAndLinting()\\`');
}
function projectSrc() {
    // Change to PascalCase.
    let appvue = fs.readFileSync(`${appRoot}/src/App.vue`, 'utf-8');
    appvue = appvue.replace('<router-view />', '<RouterView />');
    fs.writeFileSync(`${appRoot}/src/App.vue`, appvue, 'utf-8');
    // Disable shim.
    let quasarconfigts = fs.readFileSync(`${appRoot}/quasar.config.ts`, 'utf-8');
    quasarconfigts = quasarconfigts.replace('vueShim: true', 'vueShim: false');
    fs.writeFileSync(`${appRoot}/quasar.config.ts`, quasarconfigts, 'utf-8');
    // Add shared template.
    const sharedAssets = `./${path.relative(path.resolve('.'), path.resolve(`./projects/${project}`, config.sharedAssets))}`;
    const rootSharedAssets = `${sharedAssets}/templates/root`;
    if (fs.existsSync(rootSharedAssets)) {
        fs.readdirSync(rootSharedAssets).forEach((file) => {
            fs.cpSync(path.join(rootSharedAssets, file), path.join(appRoot, file), {
                recursive: true,
                force: true,
            });
        });
    }
    // Add project template.
    const rootProjectAssets = `${projectAssets}/templates/root`;
    if (fs.existsSync(rootProjectAssets)) {
        fs.readdirSync(rootProjectAssets).forEach((file) => {
            fs.cpSync(path.join(rootProjectAssets, file), path.join(appRoot, file), {
                recursive: true,
                force: true,
            });
        });
    }
    // Patch `@quasar/app-vite`, add dependency and add invoke script if `@motinet/quasar-app-extension-mnapp` is detected.
    if (fs.existsSync(path.resolve(`${appRoot}/.mnapprc.js`))) {
        patchQuasarAppVite(appRoot, packageJsonFilePath);
        extendJsonFile(packageJsonFilePath, [
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
    commitCode(appRoot, '\\`projectSrc()\\`');
}
function finishProject() {
    // Exclude `.yarn`, `dist` from search and `node_modules`, `.git` from compare.
    extendJsonFile(extensionsJsonFilePath, [
        { path: 'recommendations[]', value: 'moshfeu.compare-folders' },
    ]);
    // Putting `path` in an array to keep it as a single property in JSON file.
    extendJsonFile(settingsJsonFilePath, [
        { path: ['search.exclude', '.yarn'], value: true },
        { path: ['search.exclude', 'dist'], value: true },
    ]);
    extendJsonFile(settingsJsonFilePath, [
        { path: ['compareFolders.excludeFilter'], value: ['node_modules', '.git'] },
        { path: ['compareFolders.ignoreFileNameCase'], value: false },
    ]);
    // Add build script.
    extendJsonFile(packageJsonFilePath, [
        {
            path: 'scripts.tsc',
            value: 'yarn vue-tsc --noEmit --skipLibCheck',
        },
    ]);
    // Commit code.
    commitCode(appRoot, '\\`finishProject()\\`');
}
