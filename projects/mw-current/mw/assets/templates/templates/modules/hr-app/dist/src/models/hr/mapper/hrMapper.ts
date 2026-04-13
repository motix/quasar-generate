// sort-imports-ignore

import type { MappingProfile } from '@automapper/core';
import { addProfile, createMapper } from '@automapper/core';
import { pojos } from '@automapper/pojos';

// <% if (config.hasModule('hr-team')) { %>•+ hr-team
import memberProfile from 'models/hr/mapper/memberProfile.js';
// •- /hr-team<% } else { %>•! hr-team absent<% } %>

// <% if (config.hasModule('hr-payrolls')) { %>•+ hr-payrolls
import projectProfile from 'models/hr/mapper/projectProfile.js';
import productionSalaryProfile from 'models/hr/mapper/productionSalaryProfile.js';
import payrollProfile from 'models/hr/mapper/payrollProfile.js';
import payrollDetailProfile from 'models/hr/mapper/payrollDetailProfile.js';
// •- /hr-payrolls<% } else { %>•! hr-payrolls absent<% } %>

export const hrProfile: MappingProfile = (
  /* <% if (
    config.hasModule('hr-team')
  ) { %>•+ At least 1 presents */
  mapper,
  /* •- /At least 1 presents<% } else { %>•! All absent<% } %> */
) => {
  // <% if (config.hasModule('hr-team')) { %>•+ hr-team
  memberProfile(mapper);
  // •- /hr-team<% } else { %>•! hr-team absent<% } %>

  // <% if (config.hasModule('hr-payrolls')) { %>•+ hr-payrolls
  projectProfile(mapper);
  productionSalaryProfile(mapper);
  payrollProfile(mapper);
  payrollDetailProfile(mapper);
  // •- /hr-payrolls<% } else { %>•! hr-payrolls absent<% } %>
};

const hrMapper = createMapper({
  strategyInitializer: pojos(),
});

addProfile(hrMapper, hrProfile);

export default hrMapper;
