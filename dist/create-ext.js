import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ACCEPT_DEFAULT, cliGhostwriter, DOWN_KEY } from '@dreamonkey/cli-ghostwriter';
import setupFormatLint from './lib/format-lint.js';
import { extendJsonFile, reduceJsonFile } from './lib/json-helpers.js';
const project = process.argv[2];
const config = (await import(`../projects/${project}.js`)).default;
const extensionRoot = `output/${config.projectFolder}`;
const templatesRoot = `${extensionRoot}/templates`;
const extensionPackageJsonFilePath = path.resolve(`./${extensionRoot}/package.json`);
const templatesPackageJsonFilePath = path.resolve(`./${templatesRoot}/package.json`);
// Turning on/off functions
const f = false;
f || (await createQuasarProjects());
f || (await cleanTemplatesProject());
f || (await templatesProjectLintingAndFormatting());
f || (await finishTemplatesProject());
f || (await cleanExtensionProject());
f || (await extensionProjectLintingAndFormatting());
f || (await finishExtensionProject());
async function createQuasarProjects() {
    // Create Quasar project for the extension.
    const extensionAnswersMap = {
        'What would you like to build?': `${DOWN_KEY}`, // AppExtension (AE) for Quasar CLI
        'Project folder': `output/${config.projectFolder}`,
        'Will you use an organization to publish it?': 'y',
        'Organization name': config.organizationName,
        'Quasar App Extension ext-id': config.extensionId,
        'Pick AE code format': ACCEPT_DEFAULT, // ESM
        'Project description': config.projectDescription,
        Author: config.author,
        'License type': ACCEPT_DEFAULT,
        'Pick the needed scripts': 'a',
    };
    await cliGhostwriter({
        command: 'yarn create quasar',
        answersMap: extensionAnswersMap,
        endingMarker: 'Enjoy! - Quasar Team',
    });
    // In newly created project, create another Quasar project for templates.
    const templatesAnswersMap = {
        'What would you like to build?': ACCEPT_DEFAULT, // App with Quasar CLI
        'Project folder': templatesRoot,
        'Pick script type': `${DOWN_KEY}`, // Typescript
        'Pick Quasar App CLI variant': ACCEPT_DEFAULT, // Quasar App CLI with Vite
        'Package name': `${config.extensionId}-templates`,
        'Project product name': `${config.extensionId} Templates`,
        'Project description': `Templates for ${config.extensionId}`,
        Author: config.author,
        'Pick a Vue component style': ACCEPT_DEFAULT, // Composition API with <script setup>
        'Pick your CSS preprocessor': ACCEPT_DEFAULT, // Sass with SCSS syntax
        'Check the features needed for your project': ACCEPT_DEFAULT, // Linting
        'Add Prettier for code formatting?': ACCEPT_DEFAULT, // Y
        'Install project dependencies?': `${DOWN_KEY}`, // No
    };
    await cliGhostwriter({
        command: 'yarn create quasar',
        answersMap: templatesAnswersMap,
        endingMarker: 'Enjoy! - Quasar Team',
    });
}
async function cleanTemplatesProject() {
    // Delete `templates/public`, `templates/src`,
    // `templates/postcss.config.js`, `templates/README.md`.
    fs.rmSync(`./${templatesRoot}/public`, { recursive: true });
    fs.rmSync(`./${templatesRoot}/src`, { recursive: true });
    fs.rmSync(`./${templatesRoot}/postcss.config.js`, { recursive: true });
    fs.rmSync(`./${templatesRoot}/README.md`, { recursive: true });
    // Modify `templates/index.html` content.
    fs.writeFileSync(`./${templatesRoot}/index.html`, `<!-- Supports quasar prepare -->

<!-- quasar:entry-point -->
`, { encoding: 'utf-8' });
    // Modify `templates/quasar.config.ts` content.
    fs.writeFileSync(`./${templatesRoot}/quasar.config.ts`, `// Supports quasar prepare

export default () => {
  return {}
}
`, { encoding: 'utf-8' });
    // Uninstall packages: `@quasar/extras`, `vite-plugin-checker`,
    // `@types/node`, `autoprefixer` and upgrade all remaining packages to latest.
    reduceJsonFile(templatesPackageJsonFilePath, [
        'dependencies.@quasar/extras',
        'devDependencies.vite-plugin-checker',
        'devDependencies.@types/node',
        'devDependencies.autoprefixer',
    ]);
    await extendJsonFile(templatesPackageJsonFilePath, [
        { path: 'dependencies.quasar', value: '^2.17.7' },
        { path: 'dependencies.vue', value: '^3.5.13' },
        { path: 'dependencies.vue-router', value: '^4.5.0' },
        { path: 'devDependencies.@eslint/js', value: '^9.20.0' },
        { path: 'devDependencies.eslint', value: '^9.20.1' },
        { path: 'devDependencies.eslint-plugin-vue', value: '^9.32.0' },
        { path: 'devDependencies.globals', value: '^15.15.0' },
        { path: 'devDependencies.vue-tsc', value: '^2.2.2' },
        { path: 'devDependencies.@vue/eslint-config-typescript', value: '^14.4.0' },
        { path: 'devDependencies.@vue/eslint-config-prettier', value: '^10.2.0' },
        { path: 'devDependencies.prettier', value: '^3.5.1' },
        { path: 'devDependencies.@quasar/app-vite', value: '^2.1.0' },
        { path: 'devDependencies.typescript', value: '^5.7.3' },
    ]);
    // Create folder `templates/modules` and add default file.
    fs.mkdirSync(`./${templatesRoot}/modules`, { recursive: true });
    fs.writeFileSync(`./${templatesRoot}/modules/index.ts`, `// Dump file to prevent \`lint\` script from rasing error.
// Remove this file if any code was added.
`, { encoding: 'utf-8' });
}
async function templatesProjectLintingAndFormatting() {
    await setupFormatLint(templatesRoot);
    // Modify `templates/package.json` `lint` and `clean` script,
    // changing `src*` and `src` to `modules`
    await extendJsonFile(templatesPackageJsonFilePath, [
        {
            path: 'scripts.lint',
            value: 'eslint -c ./eslint.config.js "./modules/**/*.{ts,js,cjs,mjs,vue}"',
        },
        {
            path: 'scripts.clean',
            value: 'yarn format-imports modules && yarn format && yarn lint --fix',
        },
    ]);
}
async function finishTemplatesProject() {
    // Add build script.
    await extendJsonFile(templatesPackageJsonFilePath, [
        {
            path: 'scripts.tsc',
            value: 'yarn vue-tsc --noEmit --skipLibCheck',
        },
    ]);
    // Install templates project packages and clean code.
    await fixTemplatesQuasarAppVite();
    execSync(`cd ${templatesRoot} && yarn && yarn clean && cd ../../..`, { stdio: 'inherit' });
}
async function cleanExtensionProject() {
    // Delete `src` folder.
    fs.rmSync(`./${extensionRoot}/src`, { recursive: true });
    // Add `lodash-es` and `@types/lodash-es` to `package.json`.
    await extendJsonFile(extensionPackageJsonFilePath, [
        {
            path: 'devDependencies.lodash-es',
            value: '^4.17.21',
        },
        {
            path: 'devDependencies.@types/lodash-es',
            value: '^4.17.12',
        },
    ]);
    // Add `src` from `assets`.
    fs.cpSync(`./assets/Multi-module Extension Template/src`, `./${extensionRoot}/src`, {
        recursive: true,
    });
}
async function extensionProjectLintingAndFormatting() {
    // Copy `.vscode`, `.editorconfig`, `.prettierrc.json`, `eslint.config.js`,
    // `import-sorter.json` from `templates` to root.
    fs.cpSync(`./${templatesRoot}/.vscode`, `./${extensionRoot}/.vscode`, { recursive: true });
    fs.copyFileSync(`./${templatesRoot}/.editorconfig`, `./${extensionRoot}/.editorconfig`);
    fs.copyFileSync(`./${templatesRoot}/.prettierrc.json`, `./${extensionRoot}/.prettierrc.json`);
    fs.copyFileSync(`./${templatesRoot}/eslint.config.js`, `./${extensionRoot}/eslint.config.js`);
    fs.copyFileSync(`./${templatesRoot}/import-sorter.json`, `./${extensionRoot}/import-sorter.json`);
    // Comment out `.vscode` in `.gitignore`.
    let gitignore = fs.readFileSync(`./${extensionRoot}/.gitignore`, 'utf-8');
    gitignore = gitignore.replace('.vscode', '# .vscode');
    fs.writeFileSync(`./${extensionRoot}/.gitignore`, gitignore, {
        encoding: 'utf-8',
    });
    // Add `tsconfig.json`
    fs.writeFileSync(`./${extensionRoot}/tsconfig.json`, `{
  "extends": "./templates/.quasar/tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "rootDir": "./src",
    "outDir": "./dist",
    "paths": {}
  },
  "include": ["./src/**/*.ts"],
  "exclude": []
}
`, {
        encoding: 'utf-8',
    });
    // Add all packages under `dependencies` and `devDependencies` from
    // `templates/package.json` to `package.json` under `devDependencies`.
    const templatesPackageJson = (await import(templatesPackageJsonFilePath, { with: { type: 'json' } })).default;
    const dependencies = {
        ...templatesPackageJson.dependencies,
        ...templatesPackageJson.devDependencies,
    };
    const dependenciesAsArray = [];
    for (const prop in dependencies) {
        dependenciesAsArray.push({ path: `devDependencies.${prop}`, value: dependencies[prop] });
    }
    await extendJsonFile(extensionPackageJsonFilePath, dependenciesAsArray);
    // Add `lint`, `format` and `clean` scripts to `package.json`.
    await extendJsonFile(extensionPackageJsonFilePath, [
        {
            path: 'scripts.lint',
            value: 'eslint -c ./eslint.config.js "./src/**/*.{ts,js,cjs,mjs,vue}" && cd templates && yarn lint && cd ..',
        },
        {
            path: 'scripts.format',
            value: 'prettier --write "**/*.{js,ts,vue,scss,html,md,json}" --ignore-path templates/.gitignore',
        },
        {
            path: 'scripts.clean',
            value: 'yarn format-imports src && yarn format-imports templates/modules && yarn format && yarn lint --fix',
        },
    ]);
}
async function finishExtensionProject() {
    // Exclude `dist` from search
    const settingsJson = path.resolve(`./${extensionRoot}/.vscode/settings.json`);
    // Putting `path` in an array to keep it as a single property in JSON file
    await extendJsonFile(settingsJson, [{ path: ['search.exclude'], value: { dist: true } }]);
    // Add build script.
    await extendJsonFile(extensionPackageJsonFilePath, [
        { path: 'scripts.build', value: 'npx tsc && cd templates && yarn tsc && cd ..' },
    ]);
    // Install extension project packages, build and clean code.
    await fixExtensionQuasarAppVite();
    execSync(`cd ${extensionRoot} && yarn && yarn build && yarn clean && cd ../..`, {
        stdio: 'inherit',
    });
}
// TODO:: Remove when Quasar fixes this bug
async function fixExtensionQuasarAppVite() {
    fs.copyFileSync('./assets/fixQuasarAppVite.js', `./${extensionRoot}/fixQuasarAppVite.js`);
    await extendJsonFile(extensionPackageJsonFilePath, [
        { path: 'scripts.postinstall', value: 'node fixQuasarAppVite.js' },
    ]);
}
// TODO:: Remove when Quasar fixes this bug
async function fixTemplatesQuasarAppVite() {
    fs.copyFileSync('./assets/fixQuasarAppVite.js', `./${templatesRoot}/fixQuasarAppVite.js`);
    await extendJsonFile(templatesPackageJsonFilePath, [
        { path: 'scripts.postinstall', value: 'node fixQuasarAppVite.js && quasar prepare' },
    ]);
}
