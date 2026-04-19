import { execSync } from 'child_process';
import path from 'path';
import { pathToFileURL } from 'url';
import commitCode from './lib/commit-code.js';
import { commitCodeEnabled, output, projects } from './lib/qg-config.js';
const project = process.argv[2];
if (project === undefined) {
    throw new Error('Please provide a valid `project`');
}
const projectConfigFilePath = path.resolve(projects, project, 'project.js');
const projectConfig = (await import(pathToFileURL(projectConfigFilePath).href))
    .default;
if (projectConfig === undefined) {
    throw new Error('Please provide a valid `project.js`');
}
const root = path.resolve(output, projectConfig.projectFolder);
const normalizedFolderName = path
    .basename(projectConfig.projectFolder)
    .toLowerCase()
    .replaceAll(' ', '-');
const monorepoWorkspaceFolder = projectConfig.monorepo
    ? `${root}/${normalizedFolderName}-monorepo`
    : root;
const firebaseWorkspaceFolder = `${root}/${normalizedFolderName}-firebase`;
// Turning on/off features
const f = false;
f || createExtension();
f || (await createSites());
f || createFirebase();
// Create extension
function createExtension() {
    // Create extension.
    execSync(`yarn create-ext ${project} && cd ${monorepoWorkspaceFolder.replaceAll(' ', '\\ ')} && node init.js`, {
        stdio: 'inherit',
    });
    // Commit code.
    commitCodeEnabled && commitCode(root, `\\\`init.js\\\` in extension \\\`${project}\\\` done`);
}
// Create sites
async function createSites() {
    if (projectConfig.sites) {
        for (const site of projectConfig.sites) {
            // Create site.
            const siteConfigFilePath = path.resolve(projects, site, 'project.js');
            const siteConfig = (await import(pathToFileURL(siteConfigFilePath).href))
                .default;
            if (siteConfig === undefined) {
                throw new Error('Please provide a valid `project.js`');
            }
            execSync(`yarn create-ext-site ${site} && cd ${monorepoWorkspaceFolder.replaceAll(' ', '\\ ')}/sites/${siteConfig.packageName} && node init.js`, {
                stdio: 'inherit',
            });
            // Commit code.
            commitCodeEnabled && commitCode(root, `\\\`init.js\\\` in site \\\`${site}\\\` done`);
        }
    }
}
// Create Firebase
function createFirebase() {
    if (projectConfig.firebase) {
        // Create Firebase
        execSync(`yarn create-ext-firebase ${projectConfig.firebase} && cd ${firebaseWorkspaceFolder.replaceAll(' ', '\\ ')} && node init.js`, {
            stdio: 'inherit',
        });
        // Commit code.
        commitCodeEnabled &&
            commitCode(root, `\\\`init.js\\\` in \\\`${projectConfig.firebase}\\\` done`);
    }
}
