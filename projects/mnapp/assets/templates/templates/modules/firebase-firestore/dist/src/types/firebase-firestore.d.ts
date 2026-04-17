export {};

declare module 'composables/useConfig.js' {
  interface Config {
    docsPageSize?: number;
    releaseDocsTimeout?: number;
  }
}
