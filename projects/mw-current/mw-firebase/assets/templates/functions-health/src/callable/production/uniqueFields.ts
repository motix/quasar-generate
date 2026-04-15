import uniqueField from 'utils/health/uniqueField.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type {
  ProductionRoleAm as ProductionRole,
  ProductTypeAm as ProductType,
  ProjectAm as Project,
} from 'models/production/index.js';

export const productionRolesUniqueName = onCallWithPermission(['admin'], () => {
  return uniqueField<ProductionRole>('production_productionRoles', 'name');
});

export const productTypesUniqueName = onCallWithPermission(['admin'], () => {
  return uniqueField<ProductType>('production_productTypes', 'name');
});

export const projectsUniqueName = onCallWithPermission(['admin'], () => {
  return uniqueField<Project>('production_projects', 'name');
});

export const projectsUniqueUrlFriendlyName = onCallWithPermission(['admin'], () => {
  return uniqueField<Project>('production_projects', 'urlFriendlyName');
});
