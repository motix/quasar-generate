import type { TaskFolder, TaskFolderAm, TaskFolderVm } from 'models/tasks/index.js';

// Models

declare module 'models/finance/projects.js' {
  interface ProjectExtendedFields {
    tasks: never;
  }

  interface Project {
    // Map
    tasks: TaskFolder;
  }
}

// View Models

declare module 'models/finance/projects.js' {
  interface ProjectVm {
    // Map
    tasks: TaskFolderVm;
  }
}

// API Models

declare module 'models/finance/projects.js' {
  interface ProjectAm {
    // Map
    tasks: TaskFolderAm;
  }
}
