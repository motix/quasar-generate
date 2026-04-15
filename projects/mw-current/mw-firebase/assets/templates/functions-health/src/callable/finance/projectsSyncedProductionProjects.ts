import collectionsSynced from 'utils/health/collectionsSynced.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { ProjectAm as FinanceProject } from 'models/finance/index.js';
import type { ProjectAm as ProductionProject } from 'models/production/index.js';

import useProjectCalculator from 'composables/production/project/useProjectCalculator.js';

// finance_projects synced production_projects
export const projectsSyncedProductionProjects = onCallWithPermission(['admin'], () => {
  return collectionsSynced<ProductionProject, FinanceProject>(
    'production_projects',
    'finance_projects',
    false,
    false,
    'name',
    'isArchived',
    'name',
    'urlFriendlyName',
    'customerContact',
    (sourceDoc, destDoc) => {
      const sourceValue = sourceDoc.owner.fullName;
      const destValue = destDoc.owner;

      return destValue === sourceValue
        ? { result: true }
        : {
            result: false,
            fieldName: 'owner',
            sourceText: sourceValue,
            destText: destValue,
          };
    },
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
      const sourceValue = sourceDoc.customer;
      const destValue = destDoc.customer;

      const sourceErrors: string[] = [];
      const destErrors: string[] = [];

      if (destValue.id !== sourceValue.id) {
        sourceErrors.push(`id: '${sourceValue.id}'`);
        destErrors.push(`id: '${destValue.id}'`);
      }

      if (destValue.code !== sourceValue.code) {
        sourceErrors.push(`code: '${sourceValue.code}'`);
        destErrors.push(`code: '${destValue.code}'`);
      }

      if (destValue.name !== sourceValue.name) {
        sourceErrors.push(`name: '${sourceValue.name}'`);
        destErrors.push(`name: '${destValue.name}'`);
      }

      return sourceErrors.length === 0
        ? { result: true }
        : {
            result: false,
            fieldName: 'customer',
            sourceText: `{ ${sourceErrors.join(', ')} }`,
            destText: `{ ${destErrors.join(', ')} }`,
          };
    },
    (sourceDoc, destDoc) => {
      const sourceValue = sourceDoc.items;
      const destValue = destDoc.items.filter((item) => !item.isFinanceOnly);

      if (sourceValue.length !== destValue.length) {
        return {
          result: false,
          fieldName: 'items',
          sourceText: `length: ${sourceValue.length}`,
          destText: `length: ${destValue.length}`,
        };
      }

      const amc = useProjectCalculator<ProductionProject>();

      for (let i = 0; i < sourceValue.length; i++) {
        const sourceItem = sourceValue[i]!;
        const destItem = destValue[i]!;

        const sourceErrors: string[] = [];
        const destErrors: string[] = [];

        if (destItem.title !== sourceItem.title) {
          sourceErrors.push(`title: '${sourceItem.title}'`);
          destErrors.push(`title: '${destItem.title}'`);
        }

        if (destItem.number !== sourceItem.number) {
          sourceErrors.push(
            `number: ${sourceItem.number == null ? sourceItem.number : `'${sourceItem.number}'`}`,
          );
          destErrors.push(
            `number: ${destItem.number == null ? destItem.number : `'${destItem.number}'`}`,
          );
        }

        if (destItem.description !== sourceItem.description) {
          sourceErrors.push(
            `description: ${
              sourceItem.description == null
                ? sourceItem.description
                : `'${sourceItem.description}'`
            }`,
          );
          destErrors.push(
            `description: ${
              destItem.description == null ? destItem.description : `'${destItem.description}'`
            }`,
          );
        }

        if (destItem.productType !== sourceItem.productType.name) {
          sourceErrors.push(`productType: { name: '${sourceItem.productType.name}' }`);
          destErrors.push(
            `productType: ${
              destItem.productType == null ? destItem.productType : `'${destItem.productType}'`
            }`,
          );
        }

        if (destItem.quantity !== sourceItem.quantity) {
          sourceErrors.push(`quantity: ${sourceItem.quantity}`);
          destErrors.push(`quantity: ${destItem.quantity}`);
        }

        if (destItem.productionSalaryUnitPrice !== amc.itemProductionSalaryUnitPrice(sourceItem)) {
          sourceErrors.push(
            `itemProductionSalaryUnitPrice(item): ${amc.itemProductionSalaryUnitPrice(sourceItem)}`,
          );
          destErrors.push(`productionSalaryUnitPrice: ${destItem.productionSalaryUnitPrice}`);
        }

        if (sourceErrors.length > 0) {
          return {
            result: false,
            fieldName: 'items',
            sourceText: `[${i}]: { ${sourceErrors.join(', ')} }`,
            destText: `[${i}]: { ${destErrors.join(', ')} }`,
          };
        }
      }

      return { result: true };
    },
  );
});
