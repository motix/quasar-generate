export {};

declare module 'composables/useConfig.js' {
  interface Config {
    dateFormat?: string;
    timeFormat?: string;
    editDateFormat?: string;
    dateMask?: string;
    monthDayFormat?: string;
  }
}
