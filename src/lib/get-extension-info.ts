export default async function getExtensionInfo(extensionPackageJsonFilePath: string) {
  const extensionPackageJson = (
    await import(extensionPackageJsonFilePath, { with: { type: 'json' } })
  ).default;

  let organizationName = extensionPackageJson.name;

  organizationName = organizationName.substring(1, organizationName.lastIndexOf('/'));

  return {
    extensionPackageName: extensionPackageJson.name,
    extensionOrganizationName: organizationName,
  };
}
