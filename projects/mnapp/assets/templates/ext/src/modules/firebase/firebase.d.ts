export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FIREBASE_ENV: 'DEV' | 'STAGE' | 'PROD' | undefined;
    }
  }
}
