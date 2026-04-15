import generateProductionSalaries from 'utils/generateProductionSalaries.js';
import collectionsSynced from 'utils/health/collectionsSynced.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { ProjectAm as HrProject } from 'models/hr/index.js';
import type { ProjectAm as ProductionProject } from 'models/production/index.js';

// hr_projects synced production_projects
export const projectsSyncedProductionProjects = onCallWithPermission(['admin'], () => {
  return collectionsSynced<ProductionProject, HrProject>(
    'production_projects',
    'hr_projects',
    false,
    false,
    'name',
    'name',
    (sourceDoc, destDoc) => {
      const sourceValue = sourceDoc.finishDate;
      const destValue = destDoc.finishDate;

      return destValue.isEqual(sourceValue)
        ? { result: true }
        : {
            result: false,
            fieldName: 'finishDate',
            sourceText: sourceValue.toDate().toString(),
            destText: destValue.toDate().toString(),
          };
    },
    (sourceDoc, destDoc) => {
      const sourceValue = generateProductionSalaries(sourceDoc);
      const destValue = destDoc.productionSalaries;

      if (destValue.length !== sourceValue.length) {
        return {
          result: false,
          fieldName: 'productionSalaries.length' as keyof HrProject,
          sourceText: sourceValue.length.toString(),
          destText: destValue.length.toString(),
        };
      }

      for (let i = 0; i < destValue.length; i++) {
        const sourceProductionSalary = sourceValue[i]!;
        const destProductionSalary = destValue[i]!;

        if (destProductionSalary.amount !== sourceProductionSalary.amount) {
          return {
            result: false,
            fieldName: `productionSalaries[${i}].amount` as keyof HrProject,
            sourceText: sourceProductionSalary.amount.toString(),
            destText: destProductionSalary.amount.toString(),
          };
        }

        if (destProductionSalary.member.id !== sourceProductionSalary.member.id) {
          return {
            result: false,
            fieldName: `productionSalaries[${i}].member.id` as keyof HrProject,
            sourceText: sourceProductionSalary.member.id,
            destText: destProductionSalary.member.id,
          };
        }

        if (destProductionSalary.member.fullName !== sourceProductionSalary.member.fullName) {
          return {
            result: false,
            fieldName: `productionSalaries[${i}].member.fullName` as keyof HrProject,
            sourceText: sourceProductionSalary.member.fullName,
            destText: destProductionSalary.member.fullName,
          };
        }
      }

      return { result: true };
    },
  );
});
