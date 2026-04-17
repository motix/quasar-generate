export {};

declare module 'vue-router' {
  interface RouteMeta {
    // Used for pages where Back button on the next page shouldn't direct to them.
    // Commonly used in New page.
    isNoReturnPage?: boolean;
    // Used for pages where Back button on the next page should direct to them
    // instead of the default page.
    // Commonly used in View page.
    returnRequired?: boolean;
    replaceRoute?: boolean;
    history?: string[];
    goingBack?: boolean;
  }
}
