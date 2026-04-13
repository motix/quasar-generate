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
}

export interface CreateFirebaseConfig {
  projectFolder: string;
  packageName: string;
  version: string;
  firebaseProjectPosition: number;
  authEmulatorPort: number;
  functionsEmulatorPort: number;
  firestoreEmulatorPort: number;
  storageEmulatorPort: number;
  emulatorUiPort: number;
  functionsRegion: string;
  functionsCodebases: string[];
}
