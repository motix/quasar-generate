import path from 'path';
import { pathToFileURL } from 'url';
const qgConfigFilePath = path.resolve('./.qgrc.js');
const qgConfig = (await import(pathToFileURL(qgConfigFilePath).href)).default;
export const { assets, projects, output, commitCodeEnabled, runYarn, autoLaunch } = qgConfig;
