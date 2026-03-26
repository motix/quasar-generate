import fs from 'fs';
import path from 'path';

import { getPackageName } from './package-name.js';

export default async function (appDir: string) {
  let modules: {
    [key in string]: boolean | { prompts?: Record<string, unknown> };
  } = {};
  let moduleNames: string[] = [];

  const implementedModulesPath = path.resolve(import.meta.dirname, '../modules');
  const implementedModules = fs
    .readdirSync(implementedModulesPath)
    .filter((value) => fs.lstatSync(path.resolve(implementedModulesPath, value)).isDirectory());

  const config: {
    hasModule: (name: string) => boolean;
    hasPrompts: (name: string) => boolean;
    prompts: (name: string) => Record<string, unknown>;
    moduleIndex: (name: string) => number;
  } = {
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

    modules = (await import(`${appDir}/.${packageName}rc.js`)).default;
  } catch {
    // .[packageName]rc.js might not exist in appDir
  }

  moduleNames = Object.getOwnPropertyNames(modules).filter((value) =>
    implementedModules.includes(value),
  );

  return config;
}
