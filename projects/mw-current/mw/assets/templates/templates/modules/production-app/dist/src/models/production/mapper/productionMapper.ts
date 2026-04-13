// sort-imports-ignore

import type { MappingProfile } from '@automapper/core';

import { addProfile, createMapper } from '@automapper/core';
import { pojos } from '@automapper/pojos';

// <% if (config.hasModule('production-production-roles')) { %>•+ production-production-roles
import productionRoleProfile from 'models/production/mapper/productionRoleProfile.js';
// •- /production-production-roles<% } else { %>•! production-production-roles absent<% } %>

// <% if (config.hasModule('production-product-types')) { %>•+ production-product-types
import productTypeProfile from 'models/production/mapper/productTypeProfile.js';
import productionSalaryDetailProfile from 'models/production/mapper/productionSalaryDetailProfile.js';
// •- /production-product-types<% } else { %>•! production-product-types absent<% } %>

// <% if (config.hasModule('production-team')) { %>•+ production-team
import memberProfile from 'models/production/mapper/memberProfile.js';
// •- /production-team<% } else { %>•! production-team absent<% } %>

// <% if (config.hasModule('production-customers')) { %>•+ production-customers
import customerProfile from 'models/production/mapper/customerProfile.js';
// •- /production-customers<% } else { %>•! production-customers absent<% } %>

// <% if (config.hasModule('production-projects')) { %>•+ production-projects
import projectProfile from 'models/production/mapper/projectProfile.js';
import itemProfile from 'models/production/mapper/itemProfile.js';
import itemContributionProfile from 'models/production/mapper/itemContributionProfile.js';
// •- /production-projects<% } else { %>•! production-projects absent<% } %>

// <% if (config.hasModule('shared-tasks')) { %>•+ shared-tasks
import taskFolderProfile from 'models/tasks/mapper/taskFolderProfile.js';
import taskProfile from 'models/tasks/mapper/taskProfile.js';
import taskCommentProfile from 'models/tasks/mapper/taskCommentProfile.js';
// •- /shared-tasks<% } else { %>•! shared-tasks absent<% } %>

// <% if (config.hasModule('production-todos')) { %>•+ production-todos
import todoProfile from 'models/production/mapper/todoProfile.js';
// •- /production-todos<% } else { %>•! production-todos absent<% } %>

// <% if (config.hasModule('production-project-tasks')) { %>•+ production-project-tasks
import projectProfile_ProjectTasks from 'models/production/mapper/projectProfile_ProjectTasks.js';
// •- /production-project-tasks<% } else { %>•! production-project-tasks absent<% } %>

export const productionProfile: MappingProfile = (
  /* <% if (
    config.hasModule('production-production-roles') ||
    config.hasModule('production-customers') ||
    config.hasModule('shared-tasks')
  ) { %>•+ At least 1 presents */
  mapper,
  /* •- /At least 1 presents<% } else { %>•! All absent<% } %> */
) => {
  // <% if (config.hasModule('production-production-roles')) { %>•+ production-production-roles
  productionRoleProfile(mapper);
  // •- /production-production-roles<% } else { %>•! production-production-roles absent<% } %>

  // <% if (config.hasModule('production-product-types')) { %>•+ production-product-types
  productTypeProfile(mapper);
  productionSalaryDetailProfile(mapper);
  // •- /production-product-types<% } else { %>•! production-product-types absent<% } %>

  // <% if (config.hasModule('production-team')) { %>•+ production-team
  memberProfile(mapper);
  // •- /production-team<% } else { %>•! production-team absent<% } %>

  // <% if (config.hasModule('production-customers')) { %>•+ production-customers
  customerProfile(mapper);
  // •- /production-customers<% } else { %>•! production-customers absent<% } %>

  // <% if (config.hasModule('production-projects')) { %>•+ production-projects
  projectProfile(mapper);
  itemProfile(mapper);
  itemContributionProfile(mapper);
  // •- /production-projects<% } else { %>•! production-projects absent<% } %>

  // <% if (config.hasModule('shared-tasks')) { %>•+ shared-tasks
  taskFolderProfile(mapper);
  taskProfile(mapper);
  taskCommentProfile(mapper);
  // •- /shared-tasks<% } else { %>•! shared-tasks absent<% } %>

  // <% if (config.hasModule('production-todos')) { %>•+ production-todos
  todoProfile(mapper);
  // •- /production-todos<% } else { %>•! production-todos absent<% } %>

  // <% if (config.hasModule('production-project-tasks')) { %>•+ production-project-tasks
  projectProfile_ProjectTasks(mapper);
  // •- /production-project-tasks<% } else { %>•! production-project-tasks absent<% } %>
};

const productionMapper = createMapper({
  strategyInitializer: pojos(),
});

addProfile(productionMapper, productionProfile);

export default productionMapper;
