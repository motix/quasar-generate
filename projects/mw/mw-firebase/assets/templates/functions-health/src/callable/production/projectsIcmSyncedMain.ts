import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { MemberAm as Member, ProjectAm as Project } from 'models/production/index.js';

// production_projects items contributions member synced main
export const projectsIcmSyncedMain = onCallWithPermission(['admin'], () => {
  let itemCount = 0;

  return liteDocsSyncedMainCollection<Project, Member, 'items'>(
    'production_projects',
    'production_members',
    'items',
    [],
    {
      compare: (docSnapshot, mainDocSnapshots, fieldValue, errors) => {
        const items = fieldValue;

        items.forEach((item, itemIndex) => {
          item.contributions.forEach((contribution, contributionIndex) => {
            itemCount++;

            const memberSnapshot = mainDocSnapshots.find(
              (value) => value.id === contribution.member.id,
            );

            if (memberSnapshot) {
              contribution.member.fullName !== memberSnapshot.data().fullName &&
                errors.push(
                  `\`${docSnapshot.ref.path}.items[${itemIndex}].contributions[${contributionIndex}].member.id\` '\`${contribution.member.id}\`' has different \`fullName\` from related document in \`production_members\`.`,
                );
            } else {
              errors.push(
                `\`${docSnapshot.ref.path}.items[${itemIndex}].contributions[${contributionIndex}].member.id\` '\`${contribution.member.id}\`' does not match any document in \`production_members\`.`,
              );
            }
          });
        });
      },
      successMessage: () =>
        `\`member\` of all ${itemCount} item(s) in \`production_projects/{id}.items[index].contributions\` have the same info as in \`production_members\`.`,
    },
  );
});
