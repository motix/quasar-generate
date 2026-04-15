export default async function getExtensionInfo(extensionPackageJsonFilePath: string) {
  const extensionPackageJson = (
    await import(extensionPackageJsonFilePath, { with: { type: 'json' } })
  ).default;

  let organizationName = extensionPackageJson.name;

  organizationName = organizationName.substring(1, organizationName.lastIndexOf('/'));

  let extensionId = extensionPackageJson.name;

  extensionId = extensionId.substring(
    extensionId.lastIndexOf('/') + '/quasar-app-extension-'.length,
  );

  return {
    extensionPackageName: extensionPackageJson.name,
    extensionOrganizationName: organizationName,
    extensionId,
  };
}
