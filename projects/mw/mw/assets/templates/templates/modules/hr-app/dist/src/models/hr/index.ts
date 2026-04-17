// <% if (config.hasModule('hr-team')) { %>•+ hr-team
export * from 'models/hr/team.js';
// •- /hr-team<% } else { %>•! hr-team absent<% } %>

// <% if (config.hasModule('hr-payrolls')) { %>•+ hr-payrolls
export * from 'models/hr/payrolls.js';
// •- /hr-payrolls<% } else { %>•! hr-payrolls absent<% } %>
