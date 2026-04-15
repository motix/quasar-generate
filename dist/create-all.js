import { execSync } from 'child_process';
import commitCode from './lib/commit-code.js';
const project = process.argv[2];
const config = (await import(`../projects/${project}/project.js`)).default;
const rootWorkspaceFolder = `../quasar-generate-output/${config.projectFolder}`;
// Turning on/off features
const f = false;
const commitCodeEnabled = true;
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
    if (config.sites) {
        for (const site of config.sites) {
            // Create site.
            const siteConfig = (await import(`../projects/${site}/project.js`))
                .default;
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
    if (config.firebase) {
        // Create Firebase
        execSync(`yarn create-ext-firebase ${config.firebase} && cd ${rootWorkspaceFolder.replaceAll(' ', '\\ ')}/firebase && node init.js`, {
            stdio: 'inherit',
        });
        // Commit code.
        commitCodeEnabled &&
            commitCode(rootWorkspaceFolder, `\\\`init.js\\\` in Firebase \\\`${config.firebase}\\\` done`);
    }
}
