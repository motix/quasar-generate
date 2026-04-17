import type { DateDataConverter } from 'utils/automapper.js';

declare module 'composables/useConfig.js' {
  interface Config {
    dateDataConverter?: DateDataConverter;
  }
}
