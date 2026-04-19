import path from 'path';
import { pathToFileURL } from 'url';
const defaultConfig = {
    assets: './assets',
    projects: '../quasar-generate-projects',
    output: '../quasar-generate-output',
    commitCodeEnabled: true,
    sortImportsEnabled: true,
    runYarn: false,
    autoLaunch: false,
};
const qgConfigFilePath = path.resolve('./.qgrc.js');
const qgConfig = (await import(pathToFileURL(qgConfigFilePath).href)).default;
export const { assets, projects, output, commitCodeEnabled, sortImportsEnabled, runYarn, autoLaunch, } = qgConfig || defaultConfig;
