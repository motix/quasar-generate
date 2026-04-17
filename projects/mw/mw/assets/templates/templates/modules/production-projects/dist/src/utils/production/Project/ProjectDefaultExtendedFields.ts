import type { Project, ProjectExtendedFields, ProjectVm } from 'models/production/index.js';

export function projectDefaultExtendedFields(): Pick<Project, keyof ProjectExtendedFields> {
  return {
    // <% if (config.hasModule('production-project-tasks')) { %>•+ production-project-tasks
    tasks: {
      key: 'root',
      name: 'Root',
      folders: [],
      tasks: [],
    },
    // •- /production-project-tasks<% } else { %>•! production-project-tasks absent<% } %>
  };
}

export function projectVmDefaultExtendedFields(): Pick<ProjectVm, keyof ProjectExtendedFields> {
  return {
    // <% if (config.hasModule('production-project-tasks')) { %>•+ production-project-tasks
    tasks: {
      key: 'root',
      name: 'Root',
      folders: [],
      tasks: [],
    },
    // •- /production-project-tasks<% } else { %>•! production-project-tasks absent<% } %>
  };
}
