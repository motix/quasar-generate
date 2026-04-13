import { execSync } from 'child_process';

import commitCode from './lib/commit-code.js';
import type { CreateExtensionConfig, CreateExtSiteConfig } from './types';

const project = process.argv[2];
const config = (await import(`../projects/${project}/project.js`)).default as CreateExtensionConfig;
const rootWorkspaceFolder = `../quasar-generate-output/${config.projectFolder}`;

// Turning on/off functions
const f = false;
const commitCodeEnabled = true;

f || createExtension();
f || (await createSites());

// Create extension

function createExtension() {
  // Create extension.

  execSync(
    `yarn create-ext ${project} && cd ${rootWorkspaceFolder.replaceAll(' ', '\\ ')} && node init.js`,
    {
      stdio: 'inherit',
    },
  );

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
        .default as CreateExtSiteConfig;

      execSync(
        `yarn create-ext-site ${site} && cd ${rootWorkspaceFolder.replaceAll(' ', '\\ ')}/sites/${siteConfig.packageName} && node init.js`,
        {
          stdio: 'inherit',
        },
      );

      // Commit code.

      commitCodeEnabled &&
        commitCode(rootWorkspaceFolder, `\\\`init.js\\\` in site \\\`${site}\\\` done`);
    }
  }
}
