export {};

declare module 'vue-router' {
  interface RouteMeta {
    pageTitle?: string;
  }
}

declare module 'composables/useConfig.js' {
  interface Config {
    appName?: string;
  }
}
