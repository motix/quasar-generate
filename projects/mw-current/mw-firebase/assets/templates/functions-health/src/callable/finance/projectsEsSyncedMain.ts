import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { ProjectAm as Project, SupplierAm as Supplier } from 'models/finance/index.js';

// finance_projects expenses supplier synced main
export const projectsEsSyncedMain = onCallWithPermission(['admin'], () => {
  let itemCount = 0;

  return liteDocsSyncedMainCollection<Project, Supplier, 'expenses'>(
    'finance_projects',
    'finance_suppliers',
    'expenses',
    [],
    {
      compare: (docSnapshot, mainDocSnapshots, fieldValue, errors) => {
        const expenses = fieldValue;

        expenses.forEach((expense, index) => {
          itemCount++;

          const supplierSnapshot = mainDocSnapshots.find(
            (value) => value.id === expense.supplier.id,
          );

          if (supplierSnapshot) {
            expense.supplier.code !== supplierSnapshot.data().code &&
              errors.push(
                `\`${docSnapshot.ref.path}.expenses[${index}].supplier.id\` '\`${expense.supplier.id}\`' has different \`code\` from related document in \`finance_suppliers\`.`,
              );
            expense.supplier.name !== supplierSnapshot.data().name &&
              errors.push(
                `\`${docSnapshot.ref.path}.expenses[${index}].supplier.id\` '\`${expense.supplier.id}\`' has different \`name\` from related document in \`finance_suppliers\`.`,
              );
          } else {
            errors.push(
              `\`${docSnapshot.ref.path}.expenses[${index}].supplier.id\` '\`${expense.supplier.id}\`' does not match any document in \`finance_suppliers\`.`,
            );
          }
        });
      },
      successMessage: () =>
        `\`supplier\` of all ${itemCount} item(s) in \`finance_projects/{id}.expenses\` have the same info as in \`finance_suppliers\`.`,
    },
  );
});
