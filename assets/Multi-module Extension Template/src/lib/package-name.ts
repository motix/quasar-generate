import packageJson from '../../package.json' with { type: 'json' };

export function getPackageName() {
  let name = packageJson.name;

  name = name.substring(name.lastIndexOf('/'));
  name = name.substring('quasar-app-extension-'.length + 1);

  return name;
}

export function getOrganizationName() {
  let name = packageJson.name;

  name = name.substring(0, name.lastIndexOf('/'));

  return name;
}
