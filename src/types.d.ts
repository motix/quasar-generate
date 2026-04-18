export interface QGConfig {
  assets: string;
  projects: string;
  output: string;
  commitCodeEnabled: boolean;
  runYarn: boolean;
  autoLaunch: boolean;
}

export interface CreateAppConfig {
  projectFolder: string;
  packageName: string;
  version: string;
  productName: string;
  productDescription: string;
  author: string;
  sharedAssets: string;
  mnappLocation?: string;
}

export interface CreateExtSiteConfig extends CreateAppConfig {
  extensionId: string;
}

export interface CreateExtensionConfig {
  monorepo: boolean;
  projectFolder: string;
  organizationName: string;
  extensionId: string;
  version: string;
  projectDescription: string;
  author: string;
  mnappLocation?: string;
  sites?: string[];
  firebase?: string;
}

export interface CreateFirebaseConfig {
  projectFolder: string;
  packageName: string;
  firebaseProjectPosition: number;
  authEmulatorPort: number;
  functionsEmulatorPort: number;
  firestoreEmulatorPort: number;
  storageEmulatorPort: number;
  emulatorUiPort: number;
  functionsRegion: string;
  functionsCodebases: string[];
}
