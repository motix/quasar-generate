import fs from 'fs';

const tsconfigJson = (await import('../dev/.quasar/tsconfig.json', { with: { type: 'json' } }))
  .default;
const customPaths = (await import('./tsconfig-custom-paths.json', { with: { type: 'json' } }))
  .default;

// Same implementation as `modules-mapping.ts`.
/** @type string[] */
const modules = [];
const folders = fs
  .readdirSync('../src/modules')
  .filter((value) => fs.lstatSync(`../src/modules/${value}`).isDirectory());

folders.forEach((folder) => {
  const files = fs
    .readdirSync(`../src/modules/${folder}`)
    .filter((value) => fs.lstatSync(`../src/modules/${folder}/${value}`).isFile());

  if (files.length === 0) {
    const subFolders = fs
      .readdirSync(`../src/modules/${folder}`)
      .filter((value) => fs.lstatSync(`../src/modules/${folder}/${value}`).isDirectory());

    subFolders.forEach((subFolder) => {
      modules.push(`${folder}/${subFolder}`);
    });
  } else {
    modules.push(folder);
  }
});

// Replace `./..` with `../dev` in all paths copied from `.quasar`
for (const path in tsconfigJson.compilerOptions.paths) {
  tsconfigJson.compilerOptions.paths[path][0] =
    `../dev${tsconfigJson.compilerOptions.paths[path][0].substring(4)}`;
}

const paths = {
  ...customPaths,
  ...tsconfigJson.compilerOptions.paths,
  utils: ['../dev/src/utils'],
  'utils/*': ['../dev/src/utils/*'],
  models: ['../dev/src/models'],
  'models/*': ['../dev/src/models/*'],
  api: ['../dev/src/api'],
  'api/*': ['../dev/src/api/*'],
  services: ['../dev/src/services'],
  'services/*': ['../dev/src/services/*'],
  composables: ['../dev/src/composables'],
  'composables/*': ['../dev/src/composables/*'],
};

for (const key in paths) {
  if (!key.endsWith('/*')) {
    continue;
  }

  /** @type string[] */
  const path = paths[key];

  // Remove `../dev/` prefix from the path
  const localPath = path[0].substring(7);

  modules.forEach((module) => {
    const distPath = `./modules/${module}/dist/${localPath}`;

    // Remove trailing `/*` from the path
    if (fs.existsSync(distPath.substring(0, distPath.length - 2))) {
      path.splice(path.length - 1, 0, distPath);
    }

    const devPath = `./modules/${module}/dev/${localPath}`;

    // Remove trailing `/*` from the path
    if (fs.existsSync(devPath.substring(0, devPath.length - 2))) {
      path.splice(path.length - 1, 0, devPath);
    }
  });
}

const dotQuasarPaths = [];

modules.forEach((module) => {
  const dotQuasarPath = `./modules/${module}/dist/_quasar`;

  if (fs.existsSync(dotQuasarPath)) {
    dotQuasarPaths.push(`${dotQuasarPath}/*`);
  }
});

if (dotQuasarPaths.length > 0) {
  dotQuasarPaths.push('../dev/.quasar/*');
  paths['app/.quasar/*'] = dotQuasarPaths;
}

const json = {
  extends: '../dev/.quasar/tsconfig.json',
  compilerOptions: {
    paths: paths,
  },
};

fs.writeFileSync('./tsconfig-paths.json', JSON.stringify(json, null, 2));
