import fs from 'fs';
import path from 'path';

import { getPackageName } from './package-name.js';

export default async function (appDir: string) {
  let modules: {
    [key in string]: boolean | { prompts?: Record<string, unknown> };
  } = {};
  let moduleNames: string[] = [];
  let rawConfig: {
    deployToDev?: boolean;
    modules?: typeof modules;
  };

  const implementedModulesPath = path.resolve(import.meta.dirname, '../modules');
  const implementedModules = fs
    .readdirSync(implementedModulesPath)
    .filter((value) => fs.lstatSync(path.resolve(implementedModulesPath, value)).isDirectory());

  const config: Required<Omit<typeof rawConfig, 'modules'>> & {
    hasModule: (name: string) => boolean;
    hasPrompts: (name: string) => boolean;
    prompts: (name: string) => Record<string, unknown>;
    moduleIndex: (name: string) => number;
  } = {
    deployToDev: true,
    hasModule: (name) => implementedModules.includes(name) && !!modules[name],
    hasPrompts: (name) =>
      implementedModules.includes(name) && typeof modules[name] === 'object'
        ? !!modules[name].prompts
        : false,
    prompts: (name) =>
      implementedModules.includes(name) &&
      typeof modules[name] === 'object' &&
      !!modules[name].prompts
        ? modules[name].prompts
        : (() => {
            throw new Error(`Module '${name}' does not exist or it doesn't have prompts.`);
          })(),
    moduleIndex: (name) => moduleNames.indexOf(name),
  };

  try {
    const packageName = getPackageName().replace(/-/g, '');

    rawConfig = (await import(`${appDir}/.${packageName}rc.js`)).default;

    if (rawConfig.deployToDev !== undefined) {
      config.deployToDev = rawConfig.deployToDev;
    }

    modules = rawConfig.modules || {};
  } catch {
    // .[packageName]rc.js might not exist in appDir
  }

  moduleNames = Object.getOwnPropertyNames(modules).filter((value) =>
    implementedModules.includes(value),
  );

  return config;
}
