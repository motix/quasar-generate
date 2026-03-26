declare module '@quasar/app-vite/lib/app-extension/api-classes/InstallAPI.js' {
  import type { InstallAPI as InstallAPIInterface } from '@quasar/app-vite';

  export const InstallAPI: new (
    opts: Pick<InstallAPIInterface, 'ctx' | 'extId' | 'prompts'>,
  ) => InstallAPIInterface;
}

declare module '@quasar/app-vite/lib/utils/get-caller-path.js' {
  export function getCallerPath(): string;
}
