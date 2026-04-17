import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type {
  ProductTypeAm as ProductType,
  ProjectAm as Project,
} from 'models/production/index.js';

// production_projects items productType synced main
export const projectsIptSyncedMain = onCallWithPermission(['admin'], () => {
  let itemCount = 0;

  return liteDocsSyncedMainCollection<Project, ProductType, 'items'>(
    'production_projects',
    'production_productTypes',
    'items',
    [],
    {
      compare: (docSnapshot, mainDocSnapshots, fieldValue, errors) => {
        const items = fieldValue;

        items.forEach((item, index) => {
          itemCount++;

          const productTypeSnapshot = mainDocSnapshots.find(
            (value) => value.id === item.productType.id,
          );

          if (productTypeSnapshot) {
            item.productType.name !== productTypeSnapshot.data().name &&
              errors.push(
                `\`${docSnapshot.ref.path}.items[${index}].productType.id\` '\`${item.productType.id}\`' has different \`name\` from related document in \`production_productTypes\`.`,
              );
          } else {
            errors.push(
              `\`${docSnapshot.ref.path}.items[${index}].productType.id\` '\`${item.productType.id}\`' does not match any document in \`production_productTypes\`.`,
            );
          }
        });
      },
      successMessage: () =>
        `\`productType\` of all ${itemCount} item(s) in \`production_projects/{id}.items\` have the same info as in \`production_productTypes\`.`,
    },
  );
});
