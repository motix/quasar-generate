import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ACCEPT_DEFAULT, cliGhostwriter, DOWN_KEY, WHITESPACE_KEY, } from '@dreamonkey/cli-ghostwriter';
import setupFormatLint from './lib/format-lint.js';
import { extendJsonFile } from './lib/json-helpers.js';
const globalAssets = './assets';
const project = process.argv[2];
const autoLaunch = process.argv[3];
const config = (await import(`../projects/${project}/project.js`)).default;
const projectAssets = `./projects/${project}/assets`;
const appRoot = `./output/${config.projectFolder}`;
const settingsJson = path.resolve(`${appRoot}/.vscode/settings.json`);
const appPackageJsonFilePath = path.resolve(`${appRoot}/package.json`);
// Turning on/off functions
const f = false;
f || (await createQuasarProject());
f || setupFormatLint(appRoot);
f || cleanProject();
f || finishProject();
if (config.initProject) {
    f || initProject();
}
if (autoLaunch === '-l') {
    f || launchProject();
}
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
        Author: config.author,
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
function cleanProject() {
    // Disable shim.
    let quasarconfigts = fs.readFileSync(`${appRoot}/quasar.config.ts`, 'utf-8');
    quasarconfigts = quasarconfigts.replace('vueShim: true', 'vueShim: false');
    fs.writeFileSync(`${appRoot}/quasar.config.ts`, quasarconfigts, { encoding: 'utf-8' });
}
function finishProject() {
    // Add build script.
    extendJsonFile(appPackageJsonFilePath, [
        {
            path: 'scripts.tsc',
            value: 'yarn vue-tsc --noEmit --skipLibCheck',
        },
    ]);
    // Install the app packages and clean code.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Installing \x1b[47m${config.packageName}\x1b[0m packages and clean code...`);
    fixQuasarAppVite();
    execSync(`cd ${appRoot} && yarn && yarn clean && cd ../..`, {
        stdio: 'inherit',
    });
}
function initProject() {
    if (!config.initProject) {
        return;
    }
    const sharedAssets = `./${path.relative(path.resolve('.'), path.resolve(`./projects/${project}`, config.initProject.sharedAssets))}`;
    // Add `.mnapprc.js`.
    fs.copyFileSync(`${projectAssets}/.mnapprc.js`, `${appRoot}/.mnapprc.js`);
    // Add Font Awesome registry to `.npmrc`.
    let npmrc = fs.readFileSync(`${appRoot}/.npmrc`, 'utf-8');
    npmrc = `${npmrc}
${fs.readFileSync(`${globalAssets}/.npmrc`, 'utf-8')}`;
    fs.writeFileSync(`${appRoot}/.npmrc`, npmrc, {
        encoding: 'utf-8',
    });
    // Add `.npmrc` to `.gitignore`.
    let gitignore = fs.readFileSync(`${appRoot}/.gitignore`, 'utf-8');
    gitignore = `${gitignore}
# .npmrc
.npmrc
`;
    fs.writeFileSync(`${appRoot}/.gitignore`, gitignore, {
        encoding: 'utf-8',
    });
    // Install `mnapp`.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Installing \x1b[47mmnapp\x1b[0m...`);
    execSync(`cd ${appRoot} && yarn link @motinet/quasar-app-extension-mnapp && node fixQuasarAppVite.js && quasar ext invoke @motinet/mnapp && cd ../..`, {
        stdio: 'inherit',
    });
    // Add `.env` with Firebase config.
    fs.copyFileSync(`${projectAssets}/.env`, `${appRoot}/.env`);
    // Add `.firebase` and `.env` to `.gitignore`.
    gitignore = fs.readFileSync(`${appRoot}/.gitignore`, 'utf-8');
    gitignore = `${gitignore}
# Firebase
.firebase

# dotenv
.env
`;
    fs.writeFileSync(`${appRoot}/.gitignore`, gitignore, {
        encoding: 'utf-8',
    });
    // Modify `router/index.ts` and `router/routes.ts`.
    let routerIndexTs = fs.readFileSync(`${appRoot}/src/router/index.ts`, { encoding: 'utf-8' });
    routerIndexTs = routerIndexTs.replace('scrollBehavior: () => ({ left: 0, top: 0 }),', '// scrollBehavior: () => ({ left: 0, top: 0 }),');
    fs.writeFileSync(`${appRoot}/src/router/index.ts`, routerIndexTs, {
        encoding: 'utf-8',
    });
    let routesTs = fs.readFileSync(`${appRoot}/src/router/routes.ts`, { encoding: 'utf-8' });
    routesTs = routesTs
        .replace("path: '/'", `// Boot files will add other routes into this ruote via its name
name: 'MainLayout', path: '/'`)
        .replace('children: [', `children: [
// Index

`)
        .replace("path: ''", `// Need a name to avoid Vue Router warn
name: 'HomePage', path: '', meta: { isNoReturnPage: true }`);
    fs.writeFileSync(`${appRoot}/src/router/routes.ts`, routesTs, {
        encoding: 'utf-8',
    });
    // Replace `public`, `MainLayout.vue` and `IndexPage.vue`
    fs.rmSync(`${appRoot}/public`, { recursive: true });
    fs.cpSync(`${sharedAssets}/public`, `${appRoot}/public`, { recursive: true });
    fs.copyFileSync(`${sharedAssets}/MainLayout.vue`, `${appRoot}/src/layouts/MainLayout.vue`);
    fs.copyFileSync(`${sharedAssets}/IndexPage.vue`, `${appRoot}/src/pages/IndexPage.vue`);
    // Add Better Comments settings.
    extendJsonFile(settingsJson, [
        {
            path: 'better-comments.tags',
            value: [
                {
                    tag: '•+',
                    color: '#000000',
                    strikethrough: false,
                    underline: false,
                    backgroundColor: '#a67216',
                    bold: false,
                    italic: false,
                },
                {
                    tag: '•-',
                    color: '#000000',
                    strikethrough: true,
                    underline: false,
                    backgroundColor: '#a67216',
                    bold: false,
                    italic: false,
                },
                {
                    tag: '•!',
                    color: '#000000',
                    strikethrough: false,
                    underline: false,
                    backgroundColor: '#a67216',
                    bold: false,
                    italic: true,
                },
                {
                    tag: '!',
                    color: '#FF2D00',
                    strikethrough: false,
                    underline: false,
                    backgroundColor: 'transparent',
                    bold: false,
                    italic: false,
                },
                {
                    tag: '?',
                    color: '#3498DB',
                    strikethrough: false,
                    underline: false,
                    backgroundColor: 'transparent',
                    bold: false,
                    italic: false,
                },
                {
                    tag: '//',
                    color: '#474747',
                    strikethrough: true,
                    underline: false,
                    backgroundColor: 'transparent',
                    bold: false,
                    italic: false,
                },
                {
                    tag: 'todo',
                    color: '#FF8C00',
                    strikethrough: false,
                    underline: false,
                    backgroundColor: 'transparent',
                    bold: false,
                    italic: false,
                },
                {
                    tag: '*',
                    color: '#98C379',
                    strikethrough: false,
                    underline: false,
                    backgroundColor: 'transparent',
                    bold: false,
                    italic: false,
                },
            ],
        },
    ]);
    // Update `postinstall` script.
    extendJsonFile(appPackageJsonFilePath, [
        {
            path: 'scripts.postinstall',
            value: 'node fixQuasarAppVite.js && cross-env FIREBASE_ENV=PROD quasar prepare',
        },
    ]);
    // Format code
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Formatting code after \x1b[47mmnapp\x1b[0m installation...`);
    execSync(`cd ${appRoot} && yarn format --log-level warn && cd ../..`, {
        stdio: 'inherit',
    });
}
function launchProject() {
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Launching \x1b[47m${config.packageName}\x1b[0m in Visual Studio Code...`);
    execSync(`code ${appRoot}`, {
        stdio: 'inherit',
    });
}
// TODO: Remove when Quasar fixes this bug
function fixQuasarAppVite() {
    fs.copyFileSync('./assets/fixQuasarAppVite.js', `${appRoot}/fixQuasarAppVite.js`);
    extendJsonFile(appPackageJsonFilePath, [
        {
            path: 'scripts.postinstall',
            value: 'node fixQuasarAppVite.js && quasar prepare',
        },
    ]);
}
