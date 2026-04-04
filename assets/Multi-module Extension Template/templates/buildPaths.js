import fs from 'fs';

const tsconfigJson = (await import('../dev/.quasar/tsconfig.json', { with: { type: 'json' } }))
  .default;
const customPaths = (await import('./tsconfig-custom-paths.json', { with: { type: 'json' } }))
  .default;

const modules = fs
  .readdirSync('./modules')
  .filter((value) => fs.lstatSync(`./modules/${value}`).isDirectory());

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

  // Remove `../dev/` and `/*` from the path
  const localPath = path[0].substring(7);

  modules.forEach((module) => {
    const distPath = `./modules/${module}/dist/${localPath}`;

    if (fs.existsSync(distPath.substring(0, distPath.length - 2))) {
      path.splice(path.length - 1, 0, distPath);
    }

    const devPath = `./modules/${module}/dev/${localPath}`;

    if (fs.existsSync(devPath.substring(0, devPath.length - 2))) {
      path.splice(path.length - 1, 0, devPath);
    }
  });
}

const json = {
  extends: '../dev/.quasar/tsconfig.json',
  compilerOptions: {
    paths: paths,
  },
};

fs.writeFileSync('./tsconfig-paths.json', JSON.stringify(json, null, 2));
