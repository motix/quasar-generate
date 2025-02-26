import fs from 'fs'

const hasDev = fs.existsSync('../dev')
const tsconfigJson = (await import('./.quasar/tsconfig.json', { with: { type: 'json' } })).default
const customPaths = (await import('./tsconfig-custom-paths.json', { with: { type: 'json' } }))
  .default

const modules = fs
  .readdirSync('./modules')
  .filter((value) => fs.lstatSync(`./modules/${value}`).isDirectory())

// Replace `./..` with `.` in all paths copied from `.quasar`
for (const path in tsconfigJson.compilerOptions.paths) {
  tsconfigJson.compilerOptions.paths[path][0] =
    tsconfigJson.compilerOptions.paths[path][0].substring(3)
}

const paths = {
  ...customPaths,
  ...(hasDev ? { '*': ['../dev/node_modules/@types/*', '../dev/node_modules/*', './*'] } : {}),
  ...tsconfigJson.compilerOptions.paths,
  utils: ['./src/utils'],
  'utils/*': ['./src/utils/*'],
  models: ['./src/models'],
  'models/*': ['./src/models/*'],
  api: ['./src/api'],
  'api/*': ['./src/api/*'],
  services: ['./src/services'],
  'services/*': ['./src/services/*'],
  composables: ['./src/composables'],
  'composables/*': ['./src/composables/*'],
}

for (const key in paths) {
  if (key === '*' || !key.endsWith('*')) {
    continue
  }

  /** @type string[] */
  const path = paths[key]

  const localPath = path[0].substring(2)

  if (hasDev) {
    path.unshift(`../dev/${localPath}`)
  }
  modules.forEach((module) => {
    const distPath = `./modules/${module}/dist/${localPath}`

    if (fs.existsSync(distPath.substring(0, distPath.length - 2))) {
      path.push(distPath)
    }

    const devPath = `./modules/${module}/dev/${localPath}`

    if (fs.existsSync(devPath.substring(0, devPath.length - 2))) {
      path.push(devPath)
    }
  })
}

const json = {
  extends: './.quasar/tsconfig.json',
  compilerOptions: {
    paths: paths,
  },
}

fs.writeFileSync('./tsconfig-paths.json', JSON.stringify(json, null, 2))
