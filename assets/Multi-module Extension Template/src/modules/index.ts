import getExtensionConfig from '../lib/extension-config.js';
import type {
  IndexDefinition,
  InstallDefinition,
  PromptsDefinition,
  UninstallDefinition,
} from '../lib/extension-wrappers.js';
import getModulesMapping from '../lib/modules-mapping.js';

export default async function <
  T extends PromptsDefinition | IndexDefinition | InstallDefinition | UninstallDefinition,
>(
  appDir: string,
  script: T extends PromptsDefinition
    ? 'prompts'
    : T extends IndexDefinition
      ? 'index'
      : T extends InstallDefinition
        ? 'install'
        : T extends UninstallDefinition
          ? 'uninstall'
          : never,
) {
  const config = await getExtensionConfig(appDir);
  const implementedModules = getModulesMapping();

  let scriptDefinitions: T[] = [];
  const implementedModuleNames = Object.getOwnPropertyNames(implementedModules);

  for (const moduleName of implementedModuleNames) {
    if (!config.hasModule(moduleName)) continue;

    try {
      const scriptDefinition: T = (await import(`./${implementedModules[moduleName]}/${script}.js`))
        .default;

      Object.defineProperty(scriptDefinition, 'name', { value: moduleName });
      scriptDefinitions[config.moduleIndex(moduleName)] = scriptDefinition;
    } catch {
      // prompts, index, install or uninstall might be missing in a module
    }
  }

  scriptDefinitions = scriptDefinitions.filter((value) => !!value);

  if (script === 'uninstall') {
    scriptDefinitions.reverse();
  }

  return scriptDefinitions;
}

export {
  defineIndex,
  defineInstall,
  definePrompts,
  defineUninstall,
} from '../lib/extension-wrappers.js';
