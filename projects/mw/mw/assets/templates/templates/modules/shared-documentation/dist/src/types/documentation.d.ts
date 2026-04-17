import type { ComponentOptions } from 'vue';

declare global {
  export interface MdModule {
    attributes: Record<string, unknown>;
    VueComponent: ComponentOptions;
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    md?: () => Promise<MdModule>;
  }
}
