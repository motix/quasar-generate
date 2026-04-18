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
const rootWorkspaceFolder = path.resolve(output, projectConfig.projectFolder);
// Turning on/off features
const f = false;
f || createExtension();
f || (await createSites());
f || createFirebase();
// Create extension
function createExtension() {
    // Create extension.
    execSync(`yarn create-ext ${project} && cd ${rootWorkspaceFolder.replaceAll(' ', '\\ ')} && node init.js`, {
        stdio: 'inherit',
    });
    // Commit code.
    commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`init.js\\\` in extension \\\`${project}\\\` done`);
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
            execSync(`yarn create-ext-site ${site} && cd ${rootWorkspaceFolder.replaceAll(' ', '\\ ')}/sites/${siteConfig.packageName} && node init.js`, {
                stdio: 'inherit',
            });
            // Commit code.
            commitCodeEnabled &&
                commitCode(rootWorkspaceFolder, `\\\`init.js\\\` in site \\\`${site}\\\` done`);
        }
    }
}
// Create Firebase
function createFirebase() {
    if (projectConfig.firebase) {
        // Create Firebase
        execSync(`yarn create-ext-firebase ${projectConfig.firebase} && cd ${rootWorkspaceFolder.replaceAll(' ', '\\ ')}/firebase && node init.js`, {
            stdio: 'inherit',
        });
        // Commit code.
        commitCodeEnabled &&
            commitCode(rootWorkspaceFolder, `\\\`init.js\\\` in \\\`${projectConfig.firebase}\\\` done`);
    }
}
