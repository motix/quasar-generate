import path from 'path';
import { pathToFileURL } from 'url';

import type { QGConfig } from '../types';

const defaultConfig = {
  assets: './assets',
  projects: '../quasar-generate-projects',
  output: '../quasar-generate-output',
  commitCodeEnabled: true,
  runYarn: false,
  autoLaunch: false,
};

const qgConfigFilePath = path.resolve('./.qgrc.js');
const qgConfig = (await import(pathToFileURL(qgConfigFilePath).href)).default as
  | QGConfig
  | undefined;

export const { assets, projects, output, commitCodeEnabled, runYarn, autoLaunch } =
  qgConfig || defaultConfig;
