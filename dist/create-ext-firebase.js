import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { repeat } from 'lodash-es';
import { ACCEPT_DEFAULT, cliGhostwriter, DOWN_KEY, WHITESPACE_KEY, } from '@dreamonkey/cli-ghostwriter';
import commitCode from './lib/commit-code.js';
import { convertEslintConfigToTsOnly } from './lib/eslint-helpers.js';
import { addFormatLintDependencies } from './lib/format-lint-helpers.js';
import getExtensionInfo from './lib/get-extension-info.js';
import { extendJsonFile, reorderJsonFile } from './lib/json-helpers.js';
import packagesVersion from './lib/packages-version.js';
import { assets, autoLaunch, commitCodeEnabled, output, projects, runYarn, } from './lib/qg-config.js';
const globalAssets = path.resolve(assets, 'Firebase Template');
const project = process.argv[2];
if (project === undefined) {
    throw new Error('Please provide a valid `project`');
}
const projectAssets = path.resolve(projects, project, 'assets');
const projectConfigFilePath = path.resolve(projects, project, 'project.js');
const projectConfig = (await import(pathToFileURL(projectConfigFilePath).href))
    .default;
if (projectConfig === undefined) {
    throw new Error('Please provide a valid `project.js`');
}
const rootWorkspaceFolder = path.resolve(output, projectConfig.projectFolder);
const extensionWorkspaceFolder = `${rootWorkspaceFolder}/ext`;
const devWorkspaceFolder = `${extensionWorkspaceFolder}/dev`;
const firebaseWorkspaceFolder = `${rootWorkspaceFolder}/firebase`;
const functionsWorkspaceFolder = `${firebaseWorkspaceFolder}/functions`;
const rootPackageJsonFilePath = path.resolve(`${rootWorkspaceFolder}/package.json`);
const extensionPackageJsonFilePath = path.resolve(`${extensionWorkspaceFolder}/package.json`);
const firebasePackageJsonFilePath = path.resolve(`${firebaseWorkspaceFolder}/package.json`);
const functionsPackageJsonFilePath = path.resolve(`${functionsWorkspaceFolder}/package.json`);
const { extensionId, extensionPackageName } = await getExtensionInfo(extensionPackageJsonFilePath);
console.log(' \x1b[32mquasar-generate •\x1b[0m', `Create \x1b[47mfirebase\x1b[0m for extension \x1b[47m${extensionPackageName}\x1b[0m`);
// Turning on/off features
const f = false;
// Create workspaces
f || (await createFirebaseWorkspace());
f || prepareWorkspaces();
// Workspaces formatting and linting
f || firebaseFormattingAndLinting();
f || functionsFormattingAndLinting();
// Workspaces base source code
f || firebaseWorkspaceSrc();
f || functionsWorkspaceSrc();
// Finish workspaces
f || finishFirebaseWorkspace();
f || finishFunctionsWorkspace();
f || createFunctionsCodebases();
f || applyFunctionsProjectTemplate();
// Install and launch
f || installAndLaunch();
// Create workspaces
async function createFirebaseWorkspace() {
    // Init Firebase project.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Initializing Firebase project for \x1b[47m${projectConfig.packageName}\x1b[0m...`);
    execSync(`mkdir ${firebaseWorkspaceFolder.replaceAll(' ', '\\ ')}`);
    const answersMap = {
        'Which Firebase features do you want to set up for this directory?': `${DOWN_KEY}${WHITESPACE_KEY}${DOWN_KEY}${DOWN_KEY}${WHITESPACE_KEY}${DOWN_KEY}${DOWN_KEY}${DOWN_KEY}${WHITESPACE_KEY}${DOWN_KEY}${WHITESPACE_KEY}`, // Firestore, Functions, Storage, Emulators
        'Please select an option:': ACCEPT_DEFAULT, // Use an existing project
        'Select a default Firebase project for this directory:': `${repeat(DOWN_KEY, projectConfig.firebaseProjectPosition)}`,
        'What file should be used for Firestore Rules?': ACCEPT_DEFAULT, // firestore.rules
        'What file should be used for Firestore indexes?': ACCEPT_DEFAULT, // firestore.indexes.json
        'What language would you like to use to write Cloud Functions?': `${DOWN_KEY}`, // TypeScript
        'Do you want to use ESLint to catch probable bugs and enforce style?': 'n',
        'Do you want to install dependencies with npm now?': 'n',
        'What file should be used for Storage Rules?': ACCEPT_DEFAULT, // storage.rules
        'Which Firebase emulators do you want to set up?': `${DOWN_KEY}${WHITESPACE_KEY}${DOWN_KEY}${WHITESPACE_KEY}${DOWN_KEY}${WHITESPACE_KEY}${DOWN_KEY}${DOWN_KEY}${DOWN_KEY}${DOWN_KEY}${WHITESPACE_KEY}`, // Authentication, Functions, Firestore, Storage
        'Which port do you want to use for the auth emulator?': `${projectConfig.authEmulatorPort}`,
        'Which port do you want to use for the functions emulator?': `${projectConfig.functionsEmulatorPort}`,
        'Which port do you want to use for the firestore emulator?': `${projectConfig.firestoreEmulatorPort}`,
        'Which port do you want to use for the storage emulator?': `${projectConfig.storageEmulatorPort}`,
        'Would you like to enable the Emulator UI?': ACCEPT_DEFAULT, // Y
        'Which port do you want to use for the Emulator UI': `${projectConfig.emulatorUiPort}`,
        'Would you like to download the emulators now?': ACCEPT_DEFAULT, // Y,
        'Would you like to install agent skills for Firebase?': 'n',
    };
    await cliGhostwriter({
        command: `cd ${firebaseWorkspaceFolder.replaceAll(' ', '\\ ')} && firebase init`,
        answersMap,
        endingMarker: 'Firebase initialization complete!',
    });
    // Create `package.json`.
    fs.writeFileSync(firebasePackageJsonFilePath, JSON.stringify({
        name: projectConfig.packageName,
        type: 'module',
        private: true,
    }, null, 2), 'utf-8');
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`createFirebaseWorkspace()\\\` for \\\`${projectConfig.packageName}\\\``);
}
function prepareWorkspaces() {
    // Define workspaces.
    extendJsonFile(rootPackageJsonFilePath, [
        {
            path: 'workspaces[]',
            value: 'firebase',
        },
    ]);
    extendJsonFile(rootPackageJsonFilePath, [
        {
            path: 'workspaces[]',
            value: 'firebase/functions*',
        },
    ]);
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`prepareWorkspaces()\\\` for \\\`${projectConfig.packageName}\\\``);
}
// Workspaces formatting and linting
function firebaseFormattingAndLinting() {
    // Copy `eslint.config.js` from `dev` workspace.
    fs.copyFileSync(`${devWorkspaceFolder}/eslint.config.js`, `${firebaseWorkspaceFolder}/eslint.config.js`);
    // Truncate Vue and HTML specific configurations.
    convertEslintConfigToTsOnly(`${firebaseWorkspaceFolder}/eslint.config.js`, "'functions*/'");
    // Add `.prettierignore` to ignore `functions` and other codebase `lib`.
    fs.writeFileSync(`${firebaseWorkspaceFolder}/.prettierignore`, `/functions*/lib/
/firestore.*
`, 'utf-8');
    // Add dependencies for formatting and linting.
    addFormatLintDependencies(firebasePackageJsonFilePath);
    // Add `lint`, `format` and `clean` scripts.
    extendJsonFile(firebasePackageJsonFilePath, [
        {
            path: 'scripts.lint',
            value: 'eslint -c ./eslint.config.js "./*.{ts,js,cjs,mjs}"',
        },
        {
            path: 'scripts.format',
            value: 'prettier --write "**/*.{js,ts,md,json}" --ignore-path .gitignore --ignore-path .prettierignore',
        },
        {
            path: 'scripts.clean',
            value: 'yarn format --log-level warn && yarn lint --fix',
        },
    ]);
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`firebaseFormattingAndLinting()\\\` for \\\`${projectConfig.packageName}\\\``);
}
function functionsFormattingAndLinting() {
    // Copy `eslint.config.js` from `firebase` workspace.
    fs.copyFileSync(`${firebaseWorkspaceFolder}/eslint.config.js`, `${functionsWorkspaceFolder}/eslint.config.js`);
    // Add dependencies for formatting and linting.
    addFormatLintDependencies(functionsPackageJsonFilePath);
    // Add `lint`, `format` and `clean` scripts.
    extendJsonFile(functionsPackageJsonFilePath, [
        {
            path: 'scripts.lint',
            value: 'eslint -c ./eslint.config.js "./src/**/*.{ts,js,cjs,mjs}"',
        },
        {
            path: 'scripts.format',
            value: 'prettier --write "**/*.{js,ts,md,json}" --ignore-path .gitignore',
        },
        {
            path: 'scripts.clean',
            value: 'yarn format --log-level warn && yarn lint --fix',
        },
    ]);
    // Add linting to `predeploy` script.
    extendJsonFile(`${firebaseWorkspaceFolder}/firebase.json`, [
        {
            path: 'functions[0].predeploy',
            value: ['yarn --cwd "$RESOURCE_DIR" lint', 'yarn --cwd "$RESOURCE_DIR" build'],
        },
    ]);
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`functionsFormattingAndLinting()\\\` for \\\`${projectConfig.packageName}\\\``);
}
// Workspaces base source code
function firebaseWorkspaceSrc() {
    // Add `rebuildFunctions` from global `assets`.
    fs.copyFileSync(`${globalAssets}/rebuildFunctions.js`, `${firebaseWorkspaceFolder}/rebuildFunctions.js`);
    let rebuildFunctionsJs = fs.readFileSync(`${firebaseWorkspaceFolder}/rebuildFunctions.js`, 'utf-8');
    rebuildFunctionsJs = rebuildFunctionsJs.replace('__PACKAGE_NAME__', projectConfig.packageName);
    fs.writeFileSync(`${firebaseWorkspaceFolder}/rebuildFunctions.js`, rebuildFunctionsJs, 'utf-8');
    // Prepare settings and instructions to run functions in Firebase emulator.
    prepareFirebaseFunctionsEmulator();
    // Apply project template.
    const firebaseAssets = `${projectAssets}/templates/firebase`;
    if (fs.existsSync(firebaseAssets)) {
        fs.readdirSync(firebaseAssets).forEach((file) => {
            fs.cpSync(path.join(firebaseAssets, file), path.join(firebaseWorkspaceFolder, file), {
                recursive: true,
                force: true,
            });
        });
    }
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`firebaseWorkspaceSrc()\\\` for \\\`${projectConfig.packageName}\\\``);
}
function functionsWorkspaceSrc() {
    // Enable `module` type.
    extendJsonFile(functionsPackageJsonFilePath, [
        {
            path: 'type',
            value: 'module',
        },
    ]);
    // Upgrade dependencies.
    let packages;
    packages = ['firebase-admin', 'firebase-functions'];
    extendJsonFile(functionsPackageJsonFilePath, packages.map((item) => ({
        path: `dependencies.${item}`,
        value: packagesVersion[item],
    })));
    packages = [
        'firebase-functions-test',
        'jest', // Peer dependency of `firebase-functions-test`
        'typescript',
    ];
    extendJsonFile(functionsPackageJsonFilePath, packages.map((item) => ({
        path: `devDependencies.${item}`,
        value: packagesVersion[item],
    })));
    // Configure `compilerOptions`.
    extendJsonFile(`${functionsWorkspaceFolder}/tsconfig.json`, [
        {
            path: 'compilerOptions.rootDir',
            value: '..',
        },
        {
            path: 'compilerOptions.allowUnreachableCode',
            value: false,
        },
        {
            path: 'compilerOptions.allowUnusedLabels',
            value: false,
        },
        {
            path: 'compilerOptions.noImplicitOverride',
            value: true,
        },
        {
            path: 'compilerOptions.exactOptionalPropertyTypes',
            value: true,
        },
        {
            path: 'compilerOptions.noUncheckedIndexedAccess',
            value: true,
        },
    ]);
    // Delete `src` folder.
    fs.rmSync(`${functionsWorkspaceFolder}/src`, { recursive: true });
    // Add `src` from global `assets`.
    fs.cpSync(`${globalAssets}/functions/src`, `${functionsWorkspaceFolder}/src`, {
        recursive: true,
    });
    let indexTs = fs.readFileSync(`${functionsWorkspaceFolder}/src/index.ts`, 'utf-8');
    indexTs = indexTs.replace('__REGION__', projectConfig.functionsRegion);
    fs.writeFileSync(`${functionsWorkspaceFolder}/src/index.ts`, indexTs, 'utf-8');
    // Add `refTools` and `refUpdate` from global `assets`.
    fs.copyFileSync(`${globalAssets}/functions/refTools.js`, `${functionsWorkspaceFolder}/refTools.js`);
    fs.copyFileSync(`${globalAssets}/functions/refUpdate.js`, `${functionsWorkspaceFolder}/refUpdate.js`);
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`functionsWorkspaceSrc()\\\` for \\\`${projectConfig.packageName}\\\``);
}
// Finish workspaces
function finishFirebaseWorkspace() {
    // Ignore `emulators-data`.
    let gitignore = fs.readFileSync(`${firebaseWorkspaceFolder}/.gitignore`, 'utf-8');
    gitignore = `${gitignore}
# Emulators data
emulators-data/
`;
    fs.writeFileSync(`${firebaseWorkspaceFolder}/.gitignore`, gitignore, 'utf-8');
    // Add build, `serve` and `indexes` scripts.
    extendJsonFile(firebasePackageJsonFilePath, [
        {
            path: 'scripts.rebuildFunctions',
            value: 'node rebuildFunctions.js',
        },
        {
            path: 'scripts.serve',
            value: 'firebase emulators:start --import emulators-data --export-on-exit',
        },
        {
            path: 'scripts.indexes',
            value: 'firebase firestore:indexes > indexes.json',
        },
    ]);
    // Reorder `package.json`.
    reorderJsonFile(firebasePackageJsonFilePath);
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`finishFirebaseWorkspace()\\\` for \\\`${projectConfig.packageName}\\\``);
}
function finishFunctionsWorkspace() {
    // Set `main` to match `compilerOptions.rootDir`.
    extendJsonFile(functionsPackageJsonFilePath, [
        {
            path: 'main',
            value: 'lib/functions/src/index.js',
        },
    ]);
    // Setup build with `tsc-alias`.
    extendJsonFile(functionsPackageJsonFilePath, [
        {
            path: 'devDependencies.tsc-alias',
            value: packagesVersion['tsc-alias'],
        },
        {
            path: 'devDependencies.@types/node',
            value: packagesVersion['@types/node'],
        },
        {
            path: 'scripts.build',
            value: 'tsc && tsc-alias',
        },
        {
            path: 'scripts.build:watch',
            value: 'tsc && (concurrently "tsc -w" "tsc-alias -w")',
        },
    ]);
    // Add deploy script.
    extendJsonFile(functionsPackageJsonFilePath, [
        {
            path: 'scripts.deploy',
            value: 'firebase deploy --only functions:default',
        },
    ]);
    // Reorder `package.json`.
    reorderJsonFile(functionsPackageJsonFilePath);
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`finishFunctionsWorkspace()\\\` for \\\`${projectConfig.packageName}\\\``);
}
function createFunctionsCodebases() {
    for (const codebase of projectConfig.functionsCodebases) {
        // Create codebase workspace from `functions` workspace.
        const codebaseWorkspaceFolder = `${functionsWorkspaceFolder}-${codebase}`;
        fs.cpSync(functionsWorkspaceFolder, codebaseWorkspaceFolder, { recursive: true });
        // Truncate shared code.
        fs.rmSync(`${codebaseWorkspaceFolder}/refTools.js`);
        fs.rmSync(`${codebaseWorkspaceFolder}/src/models`, { recursive: true });
        fs.rmSync(`${codebaseWorkspaceFolder}/src/types`, { recursive: true });
        fs.rmSync(`${codebaseWorkspaceFolder}/src/utils`, { recursive: true });
        // Modify `package.json`.
        extendJsonFile(`${codebaseWorkspaceFolder}/package.json`, [
            {
                path: 'name',
                value: `functions-${codebase}`,
            },
            {
                path: 'scripts.deploy',
                value: `firebase deploy --only functions:${codebase}`,
            },
            {
                path: 'main',
                value: `lib/functions-${codebase}/src/index.js`,
            },
        ]);
        // Modify `firebase.json`.
        extendJsonFile(`${firebaseWorkspaceFolder}/firebase.json`, [
            {
                path: 'functions[]',
                value: {
                    source: `functions-${codebase}`,
                    codebase,
                    disallowLegacyRuntimeConfig: true,
                    ignore: ['node_modules', '.git', 'firebase-debug.log', 'firebase-debug.*.log', '*.local'],
                    predeploy: ['yarn --cwd "$RESOURCE_DIR" lint', 'yarn --cwd "$RESOURCE_DIR" build'],
                },
            },
        ]);
        // Modify `index.ts`.
        let indexTs = fs.readFileSync(`${codebaseWorkspaceFolder}/src/index.ts`, 'utf-8');
        indexTs = indexTs.replace('export const app = group;', `export const ${codebase} = group;`);
        fs.writeFileSync(`${codebaseWorkspaceFolder}/src/index.ts`, indexTs, 'utf-8');
    }
    // Commit code.
    commitCodeEnabled &&
        projectConfig.functionsCodebases.length > 0 &&
        commitCode(rootWorkspaceFolder, `\\\`createFunctionsCodebases()\\\` for \\\`${projectConfig.packageName}\\\``);
}
function applyFunctionsProjectTemplate() {
    let dirty = false;
    // Apply project template to `functions` workspace.
    const functionsAssets = `${projectAssets}/templates/functions`;
    if (fs.existsSync(functionsAssets)) {
        fs.readdirSync(functionsAssets).forEach((file) => {
            fs.cpSync(path.join(functionsAssets, file), path.join(functionsWorkspaceFolder, file), {
                recursive: true,
                force: true,
            });
        });
        dirty = true;
    }
    for (const codebase of projectConfig.functionsCodebases) {
        // Apply project template to codebase workspace.
        const codebaseWorkspaceFolder = `${functionsWorkspaceFolder}-${codebase}`;
        const codebaseAssets = `${projectAssets}/templates/functions-${codebase}`;
        if (fs.existsSync(codebaseAssets)) {
            fs.readdirSync(codebaseAssets).forEach((file) => {
                fs.cpSync(path.join(codebaseAssets, file), path.join(codebaseWorkspaceFolder, file), {
                    recursive: true,
                    force: true,
                });
            });
            dirty = true;
        }
    }
    // Commit code.
    commitCodeEnabled &&
        dirty &&
        commitCode(rootWorkspaceFolder, `\\\`applyFunctionsProjectTemplate()\\\` for \\\`${projectConfig.packageName}\\\``);
}
// Install and launch
function installAndLaunch() {
    // Install all workspaces packages, build and clean code.
    console.log(' \x1b[32mquasar-generate •\x1b[0m', `Installing \x1b[47m${projectConfig.packageName}\x1b[0m packages, build and clean code...`);
    if (runYarn) {
        execSync(`cd ${firebaseWorkspaceFolder.replaceAll(' ', '\\ ')} && yarn && yarn rebuildFunctions && yarn clean && yarn serve`, {
            stdio: 'inherit',
        });
    }
    else {
        console.log(`                   Run \x1b[47mcd ${firebaseWorkspaceFolder.replaceAll(' ', '\\ ')} && yarn && yarn rebuildFunctions && yarn clean && yarn serve\x1b[0m manually.`);
    }
    // Auto launch
    if (autoLaunch) {
        console.log(' \x1b[32mquasar-generate •\x1b[0m', `Launching \x1b[47m${extensionId}\x1b[0m in Visual Studio Code...`);
        execSync(`code ${rootWorkspaceFolder}.replaceAll(' ', '\\ ')`, {
            stdio: 'inherit',
        });
    }
}
// Internal
function prepareFirebaseFunctionsEmulator() {
    extendJsonFile(firebasePackageJsonFilePath, [
        {
            path: 'workspaces',
            value: ['functions*'],
        },
    ]);
    fs.writeFileSync(`${firebaseWorkspaceFolder}/.yarnrc.yml`, `# nodeLinker: node-modules
# nmHoistingLimits: workspaces
`, 'utf-8');
    fs.mkdirSync(`${firebaseWorkspaceFolder}/doc`, { recursive: true });
    fs.writeFileSync(`${firebaseWorkspaceFolder}/doc/Notes.md`, `To run Firebase functions locally via Firebase emulators:

1. Copy the whole folder to a different folder out of the root workspace.
2. Uncomment all lines in \`.yarnrc.yml\`.
3. Modify \`refRoot\` variable in \`functions/refTools.ts\`.
4. Run \`yarn && yarn rebuildFunctions && yarn serve\`.
`, 'utf-8');
}
