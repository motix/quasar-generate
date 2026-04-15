import type { CollectionGroup } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';

import onCallWithPermission from 'utils/onCallWithPermission.js';
import { collectionForeach } from 'utils/queryForeach.js';

import type { HealthCheckResult } from 'models/health/index.js';
import type {
  ProductionSalaryDetailAm as ProductionSalaryDetail,
  ProductTypeAm as ProductType,
} from 'models/production/index.js';

// productionSalaryDetails unique productionRole
export const productionSalaryDetailsUniqueProductionRole = onCallWithPermission(
  ['admin'],
  async () => {
    const successes: string[] = [];
    const errors: string[] = [];
    const info: string[] = [];

    const collectionPath = 'production_productTypes';
    const subCollectionId = 'productionSalaryDetails';

    const db = getFirestore();
    const collectionRef = db.collectionGroup(
      subCollectionId,
    ) as CollectionGroup<ProductionSalaryDetail>;
    const docsSnapshot = await collectionRef.limit(1).get();
    let docCount = 0;

    if (docsSnapshot.empty) {
      info.push(`There is no document in \`${collectionPath}/{id}/${subCollectionId}\`.`);
    } else {
      await collectionForeach<ProductType>(collectionPath, async (parentDocSnapshot) => {
        await collectionForeach<ProductionSalaryDetail>(
          `${parentDocSnapshot.ref.path}/${subCollectionId}`,
          async (docSnapshot, prevDocSnapshot) => {
            docCount++;

            if (!prevDocSnapshot) {
              return Promise.resolve();
            }

            if (docSnapshot.data().productionRole.id === prevDocSnapshot.data().productionRole.id) {
              errors.push(
                `\`${docSnapshot.ref.path}\` and \`${
                  prevDocSnapshot.ref.path
                }\` have the same \`productionRole\` '\`${docSnapshot.data().productionRole.id}\`'.`,
              );
            }

            return Promise.resolve();
          },
          'productionRole.id',
        );
      });

      if (errors.length === 0) {
        successes.push(
          `\`productionRole\` are unique in all ${docCount} document(s) in \`${collectionPath}/{id}/${subCollectionId}\`.`,
        );
      }
    }

    const result: HealthCheckResult = {
      successes,
      errors,
      info,
    };

    return result;
  },
);
