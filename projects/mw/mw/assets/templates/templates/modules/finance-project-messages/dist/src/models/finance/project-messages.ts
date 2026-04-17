export {};

// Models

declare module 'models/finance/projects.js' {
  interface ProjectExtendedFields {
    rawSlackMessages: never;
  }

  interface Project {
    // Map
    rawSlackMessages: Message[];
  }
}

// View Models

declare module 'models/finance/projects.js' {
  interface ProjectVm {
    // Map
    rawSlackMessages: Message[];
  }
}

// API Models

declare module 'models/finance/projects.js' {
  interface ProjectAm {
    // Map
    rawSlackMessages: Message[];
  }
}
