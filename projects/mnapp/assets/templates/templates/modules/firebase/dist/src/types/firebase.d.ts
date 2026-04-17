export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FIREBASE_ENV: 'DEV' | 'STAGE' | 'PROD' | undefined;
      FIREBASE_CONFIG: string | undefined;
      FIREBASE_CLIENT_ID: string | undefined;
    }
  }
}

declare module 'composables/useConfig.js' {
  interface Config {
    firebaseRegion?: string;
  }
}
