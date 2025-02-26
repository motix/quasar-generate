export interface CreateAppConfig {
  projectFolder: string
  packageName: string
  productName: string
  productDescription: string
  author: string
  initProject: false | { sharedAssets: string }
}

export interface CreateExtensionConfig {
  projectFolder: string
  organizationName: string
  extensionId: string
  projectDescription: string
  author: string
  hasDev: false | { project: string }
}
