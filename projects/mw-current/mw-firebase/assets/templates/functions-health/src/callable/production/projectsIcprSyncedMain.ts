import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type {
  ProductionRoleAm as ProductionRole,
  ProjectAm as Project,
} from 'models/production/index.js';

// production_projects items contributions productionRole synced main
export const projectsIcprSyncedMain = onCallWithPermission(['admin'], () => {
  let itemCount = 0;

  return liteDocsSyncedMainCollection<Project, ProductionRole, 'items'>(
    'production_projects',
    'production_productionRoles',
    'items',
    [],
    {
      compare: (docSnapshot, mainDocSnapshots, fieldValue, errors) => {
        const items = fieldValue;

        items.forEach((item, itemIndex) => {
          item.contributions.forEach((contribution, contributionIndex) => {
            itemCount++;

            const productionRoleSnapshot = mainDocSnapshots.find(
              (value) => value.id === contribution.productionRole.id,
            );

            if (productionRoleSnapshot) {
              contribution.productionRole.name !== productionRoleSnapshot.data().name &&
                errors.push(
                  `\`${docSnapshot.ref.path}.items[${itemIndex}].contributions[${contributionIndex}].productionRole.id\` '\`${contribution.productionRole.id}\`' has different \`name\` from related document in \`production_productionRoles\`.`,
                );
            } else {
              errors.push(
                `\`${docSnapshot.ref.path}.items[${itemIndex}].contributions[${contributionIndex}].productionRole.id\` '\`${contribution.productionRole.id}\`' does not match any document in \`production_productionRoles\`.`,
              );
            }
          });
        });
      },
      successMessage: () =>
        `\`productionRole\` of all ${itemCount} item(s) in \`production_projects/{id}.items[index].contributions\` have the same info as in \`production_productionRoles\`.`,
    },
  );
});
