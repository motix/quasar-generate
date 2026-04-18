import path from 'path';
import { pathToFileURL } from 'url';

import type { QGConfig } from '../types';

const qgConfigFilePath = path.resolve('./.qgrc.js');
const qgConfig = (await import(pathToFileURL(qgConfigFilePath).href)).default as QGConfig;

export const { assets, projects, output, commitCodeEnabled, runYarn, autoLaunch } = qgConfig;
