export const userRoles = ['admin', 'user<%= userRoles %>'] as const;
export const adminRole = userRoles[0];
export const userRole = userRoles[1];

export type UserRole = (typeof userRoles)[number];
export type UserClaims = Partial<Record<UserRole, boolean>>;
