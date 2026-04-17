export {};

declare module 'vue-router' {
  interface RouteMeta {
    mainTransitionKey?: string;
    subTransitionKeyName?: string;
  }
}
