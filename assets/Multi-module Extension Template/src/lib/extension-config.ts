import getModulesMapping from './modules-mapping.js';
import { getPackageName } from './package-name.js';

export default async function (appDir: string) {
  let configModules: {
    [key in string]: boolean | { prompts?: Record<string, unknown> };
  } = {};
  let deployingModuleNames: string[] = [];
  let rawConfig: {
    deployToDev?: boolean;
    modules?: typeof configModules;
  };

  const implementedModules = getModulesMapping();

  const config: Required<Omit<typeof rawConfig, 'modules'>> & {
    hasModule: (name: string) => boolean;
    hasPrompts: (name: string) => boolean;
    prompts: (name: string) => Record<string, unknown>;
    moduleIndex: (name: string) => number;
  } = {
    deployToDev: true,
    hasModule: (name) => !!implementedModules[name] && !!configModules[name],
    hasPrompts: (name) =>
      !!implementedModules[name] && typeof configModules[name] === 'object'
        ? !!configModules[name].prompts
        : false,
    prompts: (name) =>
      !!implementedModules[name] &&
      typeof configModules[name] === 'object' &&
      !!configModules[name].prompts
        ? configModules[name].prompts
        : (() => {
            throw new Error(`Module '${name}' does not exist or it doesn't have prompts.`);
          })(),
    moduleIndex: (name) => deployingModuleNames.indexOf(name),
  };

  try {
    const packageName = getPackageName().replace(/-/g, '');

    rawConfig = (await import(`${appDir}/.${packageName}rc.js`)).default;

    if (rawConfig.deployToDev !== undefined) {
      config.deployToDev = rawConfig.deployToDev;
    }

    configModules = rawConfig.modules || {};
  } catch {
    // .[packageName]rc.js might not exist in appDir
  }

  deployingModuleNames = Object.getOwnPropertyNames(configModules).filter(
    (value) => !!implementedModules[value],
  );

  return config;
}
