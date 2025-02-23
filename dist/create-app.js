import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ACCEPT_DEFAULT, cliGhostwriter, DOWN_KEY, WHITESPACE_KEY, } from '@dreamonkey/cli-ghostwriter';
import setupFormatLint from './lib/format-lint.js';
import { extendJsonFile } from './lib/json-helpers.js';
const globalAssets = './assets';
const project = process.argv[2];
const config = (await import(`../projects/${project}/project.js`)).default;
// const sharedAssets = `./${path.relative(path.resolve('.'), path.resolve(`./projects/${project}`, config.sharedAssets))}`
const projectAssets = `./projects/${project}/assets`;
const appRoot = `./output/${config.projectFolder}`;
const settingsJson = path.resolve(`${appRoot}/.vscode/settings.json`);
const appPackageJsonFilePath = path.resolve(`${appRoot}/package.json`);
// Turning on/off functions
const f = false;
f || (await createQuasarProject());
f || setupFormatLint(appRoot);
f || finishProject();
f || initProject();
async function createQuasarProject() {
    // Create Quasar project for the app.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Creating Quasar project for \x1b[47m${config.packageName}\x1b[0m`);
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
function finishProject() {
    // Add build script.
    extendJsonFile(appPackageJsonFilePath, [
        {
            path: 'description',
            value: `Add build scipt ${new Date().toString()}`,
        },
        {
            path: 'scripts.tsc',
            value: 'yarn vue-tsc --noEmit --skipLibCheck',
        },
    ]);
    // Install the app packages and clean code.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Installing \x1b[47m${config.packageName}\x1b[0m packages and clean code`);
    fixQuasarAppVite();
    execSync(`cd ${appRoot} && yarn && yarn clean && cd ../..`, {
        stdio: 'inherit',
    });
}
function initProject() {
    // Add `.mnapprc.js`.
    fs.copyFileSync(`${projectAssets}/.mnapprc.js`, `${appRoot}/.mnapprc.js`);
    // Add Font Awesome registry to `.npmrc`.
    let npmrc = fs.readFileSync(`${appRoot}/.npmrc`, 'utf-8');
    if (!npmrc.includes('@fortawesome:registry')) {
        npmrc = `${npmrc}
${fs.readFileSync(`${globalAssets}/.npmrc`, 'utf-8')}`;
        fs.writeFileSync(`${appRoot}/.npmrc`, npmrc, {
            encoding: 'utf-8',
        });
    }
    // Add `.npmrc` to `.gitignore`.
    let gitignore = fs.readFileSync(`${appRoot}/.gitignore`, 'utf-8');
    if (!gitignore.includes('.npmrc')) {
        gitignore = `${gitignore}
# .npmrc
.npmrc
`;
        fs.writeFileSync(`${appRoot}/.gitignore`, gitignore, {
            encoding: 'utf-8',
        });
    }
    // Install `mnapp`.
    execSync(`cd ${appRoot} && yarn link @motinet/quasar-app-extension-mnapp && node fixQuasarAppVite.js && quasar ext invoke @motinet/mnapp && cd ../..`, {
        stdio: 'inherit',
    });
    // Add `.env` with Firebase config.
    fs.copyFileSync(`${projectAssets}/.env`, `${appRoot}/.env`);
    // Add `.firebase` and `.env` to `.gitignore`.
    gitignore = fs.readFileSync(`${appRoot}/.gitignore`, 'utf-8');
    if (!gitignore.includes('.firebase')) {
        gitignore = `${gitignore}
# Firebase
.firebase
`;
    }
    if (!gitignore.includes('# dotenv')) {
        gitignore = `${gitignore}
# dotenv
.env
`;
    }
    fs.writeFileSync(`${appRoot}/.gitignore`, gitignore, {
        encoding: 'utf-8',
    });
    // Update `postinstall` script.
    extendJsonFile(appPackageJsonFilePath, [
        {
            path: 'description',
            value: `Update postinstall script ${new Date().toString()}`,
        },
        {
            path: 'scripts.postinstall',
            value: 'node fixQuasarAppVite.js && cross-env FIREBASE_ENV=PROD quasar prepare',
        },
    ]);
    // Add Better Comments settings
    extendJsonFile(settingsJson, [
        {
            path: 'description',
            value: `Add Better Comments settings ${new Date().toString()}`,
        },
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
}
// TODO: Remove when Quasar fixes this bug
function fixQuasarAppVite() {
    fs.copyFileSync('./assets/fixQuasarAppVite.js', `${appRoot}/fixQuasarAppVite.js`);
    extendJsonFile(appPackageJsonFilePath, [
        {
            path: 'description',
            value: `fixQuasarAppVite ${new Date().toString()}`,
        },
        {
            path: 'scripts.postinstall',
            value: 'node fixQuasarAppVite.js && quasar prepare',
        },
    ]);
}
