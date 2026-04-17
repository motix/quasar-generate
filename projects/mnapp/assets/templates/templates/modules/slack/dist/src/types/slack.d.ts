export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SLACK_ACCESS_TOKEN: string;
    }
  }
}
