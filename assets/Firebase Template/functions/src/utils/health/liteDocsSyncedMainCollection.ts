import type {
  CollectionReference,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';

import { collectionForeach, collectionGroupForeach } from 'utils/queryForeach.js';

import type { HealthCheckResult } from 'models/health/index.js';

export default async function liteDocsSyncedMainCollection<
  TParent extends DocumentData,
  TMain extends DocumentData,
  FieldPath extends Extract<keyof TParent, string>,
>(
  collectionPath: string,
  mainCollectionPath: string,
  fieldPath: FieldPath,
  compareFieldNames: Extract<keyof TMain, string>[],
  options?: {
    useCollectionGroup?: boolean;
    compare?: (
      docSnapshot: QueryDocumentSnapshot<TParent, TParent>,
      mainDocSnapshots: QueryDocumentSnapshot<TMain, TMain>[],
      fieldValue: TParent[FieldPath],
      errors: string[],
    ) => void;
    successMessage?: () => string;
  },
) {
  const successes: string[] = [];
  const errors: string[] = [];
  const info: string[] = [];

  const db = getFirestore();
  const query = options?.useCollectionGroup
    ? db.collectionGroup(collectionPath)
    : db.collection(collectionPath);
  const docsSnapshot = await query.limit(1).get();

  if (docsSnapshot.empty) {
    info.push(`There is no document in \`${collectionPath}\`.`);
  } else {
    const mainCollectionRef = db.collection(mainCollectionPath) as CollectionReference<
      TMain,
      TMain
    >;
    const mainDocSnapshots = (await mainCollectionRef.get()).docs;
    let docCount = 0;

    const callback = async (docSnapshot: QueryDocumentSnapshot<TParent, TParent>) => {
      docCount++;

      const fieldValue = docSnapshot.get(fieldPath) as TParent[FieldPath];

      if (fieldValue) {
        if (options?.compare) {
          options.compare(docSnapshot, mainDocSnapshots, fieldValue, errors);
        } else {
          const mainDocSnapshot = mainDocSnapshots.find((value) => value.id === fieldValue.id);

          if (mainDocSnapshot) {
            compareFieldNames.forEach((compareFieldName) => {
              if (fieldValue[compareFieldName] !== mainDocSnapshot.data()[compareFieldName]) {
                errors.push(
                  `\`${docSnapshot.ref.path}.${fieldPath}.id\` '\`${fieldValue.id}\`' has different \`${compareFieldName}\` from related document in \`${mainCollectionPath}\`.`,
                );
              }
            });
          } else {
            errors.push(
              `\`${docSnapshot.ref.path}.${fieldPath}.id\` '\`${fieldValue.id}\`' does not match any document in \`${mainCollectionPath}\`.`,
            );
          }
        }
      }

      await Promise.resolve();
    };

    if (options?.useCollectionGroup) {
      await collectionGroupForeach(collectionPath, callback);
    } else {
      await collectionForeach(collectionPath, callback);
    }

    if (errors.length === 0) {
      successes.push(
        options?.successMessage
          ? options.successMessage()
          : `\`${fieldPath}\` of all ${docCount} document(s) in \`${collectionPath}\` have the same info as in \`${mainCollectionPath}\`.`,
      );
    }
  }

  const result: HealthCheckResult = {
    successes,
    errors,
    info,
  };

  return result;
}
