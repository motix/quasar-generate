import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ACCEPT_DEFAULT, cliGhostwriter, DOWN_KEY, WHITESPACE_KEY, } from '@dreamonkey/cli-ghostwriter';
import setupFormatLint from './lib/format-lint.js';
import { extendJsonFile } from './lib/json-helpers.js';
const project = process.argv[2];
const config = (await import(`../projects/${project}.js`)).default;
const appRoot = `output/${config.projectFolder}`;
const appPackageJsonFilePath = path.resolve(`./${appRoot}/package.json`);
// Turning on/off functions
const f = false;
f || (await createQuasarProject());
f || (await setupFormatLint(appRoot));
f || (await finishProject());
async function createQuasarProject() {
    const answersMap = {
        'What would you like to build?': ACCEPT_DEFAULT, // App with Quasar CLI
        'Project folder': `output/${config.projectFolder}`,
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
async function finishProject() {
    await extendJsonFile(appPackageJsonFilePath, [
        {
            path: 'scripts.tsc',
            value: 'yarn vue-tsc --noEmit --skipLibCheck',
        },
    ]);
    await fixQuasarAppVite();
    execSync(`cd ${appRoot} && yarn && yarn clean && cd ../..`, {
        stdio: 'inherit',
    });
}
// TODO:: Remove when Quasar fixes this bug
async function fixQuasarAppVite() {
    fs.copyFileSync('./assets/fixQuasarAppVite.js', `./${appRoot}/fixQuasarAppVite.js`);
    await extendJsonFile(appPackageJsonFilePath, [
        { path: 'scripts.postinstall', value: 'node fixQuasarAppVite.js && quasar prepare' },
    ]);
}
