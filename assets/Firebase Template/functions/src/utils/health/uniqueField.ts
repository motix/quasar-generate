import type { DocumentData } from 'firebase-admin/firestore';

import { collectionForeach } from 'utils/queryForeach.js';

import type { HealthCheckResult } from 'models/health/index.js';

export default async function uniqueField<T extends DocumentData>(
  collectionPath: string,
  fieldPath: Extract<keyof T, string>,
) {
  const successes: string[] = [];
  const errors: string[] = [];
  const info: string[] = [];

  let docCount = 0;

  await collectionForeach<T>(
    collectionPath,
    (docSnapshot, prevDocSnapshot) => {
      docCount++;

      if (!prevDocSnapshot) {
        return Promise.resolve();
      }

      if (docSnapshot.get(fieldPath) === prevDocSnapshot.get(fieldPath)) {
        errors.push(
          `\`${docSnapshot.ref.path}\` and \`${
            prevDocSnapshot.ref.path
          }\` have the same \`${fieldPath}\` '\`${docSnapshot.get(fieldPath)}\`'.`,
        );
      }

      return Promise.resolve();
    },
    fieldPath,
  );

  if (errors.length === 0) {
    if (docCount === 0) {
      info.push(`There is no document in \`${collectionPath}\`.`);
    } else if (docCount > 1) {
      successes.push(
        `\`${fieldPath}\`s are unique in all ${docCount} documents in \`${collectionPath}\`.`,
      );
    } else {
      info.push(`There is only 1 document in \`${collectionPath}\`.`);
    }
  }

  const result: HealthCheckResult = {
    successes,
    errors,
    info,
  };

  return result;
}
