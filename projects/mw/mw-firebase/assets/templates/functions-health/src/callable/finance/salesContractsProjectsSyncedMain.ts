import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type {
  ProjectAm as Project,
  SalesContractAm as SalesContract,
} from 'models/finance/index.js';

// finance_salesContracts projects synced main
export const salesContractsProjectsSyncedMain = onCallWithPermission(['admin'], () => {
  let itemCount = 0;

  return liteDocsSyncedMainCollection<SalesContract, Project, 'projectIds'>(
    'finance_salesContracts',
    'finance_projects',
    'projectIds',
    [],
    {
      compare: (docSnapshot, mainDocSnapshots, fieldValue, errors) => {
        const projectIds = fieldValue;

        projectIds.forEach((projectId, index) => {
          itemCount++;

          const projectSnapshot = mainDocSnapshots.find((value) => value.id === projectId);

          if (!projectSnapshot) {
            errors.push(
              `\`${docSnapshot.ref.path}.projectIds[${index}]\` '\`${projectId}\`' does not match any document in \`finance_projects\`.`,
            );
          }
        });
      },
      successMessage: () =>
        `All ${itemCount} item(s) in \`finance_salesContracts/{id}.projectIds\` have a relevent document in \`finance_projects\`.`,
    },
  );
});
