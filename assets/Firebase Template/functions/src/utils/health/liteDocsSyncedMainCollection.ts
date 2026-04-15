import type { CollectionReference, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';

import { collectionForeach, collectionGroupForeach } from 'utils/queryForeach.js';

import type { HealthCheckResult } from 'models/health/index.js';

type ObjectWithIdKeys<T> = {
  [K in keyof T]-?: T[K] extends { id: string } | null | undefined ? K : never;
}[keyof T];

interface BaseLiteDocsSyncedMainCollectionOptions {
  useCollectionGroup?: boolean;
  successMessage?: () => string;
}

type LiteDocsSyncedMainCollectionOptionsWithCompare<
  TParent,
  TMain,
  FieldPath extends Extract<keyof TParent, string>,
> = BaseLiteDocsSyncedMainCollectionOptions & {
  compare: (
    docSnapshot: QueryDocumentSnapshot<TParent>,
    mainDocSnapshots: QueryDocumentSnapshot<TMain>[],
    fieldValue: TParent[FieldPath],
    errors: string[],
  ) => void;
};

// Overload 1: `options` is optional and `compare` not provided

export default async function liteDocsSyncedMainCollection<
  TParent,
  TMain,
  FieldPath extends Extract<keyof TParent, string & ObjectWithIdKeys<TParent>>,
>(
  collectionPath: string,
  mainCollectionPath: string,
  fieldPath: FieldPath,
  compareFieldNames: Extract<keyof (TMain | NonNullable<TParent[FieldPath]>), string>[],
  options?: BaseLiteDocsSyncedMainCollectionOptions,
): Promise<HealthCheckResult>;

// Overload 2: `compare` provided

export default async function liteDocsSyncedMainCollection<
  TParent,
  TMain,
  FieldPath extends Extract<keyof TParent, string>,
>(
  collectionPath: string,
  mainCollectionPath: string,
  fieldPath: FieldPath,
  compareFieldNames: Extract<keyof (TMain | NonNullable<TParent[FieldPath]>), string>[],
  options: LiteDocsSyncedMainCollectionOptionsWithCompare<TParent, TMain, FieldPath>,
): Promise<HealthCheckResult>;

// Implementation

export default async function liteDocsSyncedMainCollection<
  TParent,
  TMain,
  FieldPath extends Extract<keyof TParent, string>,
>(
  collectionPath: string,
  mainCollectionPath: string,
  fieldPath: FieldPath,
  compareFieldNames: Extract<keyof (TMain | NonNullable<TParent[FieldPath]>), string>[],
  options?:
    | BaseLiteDocsSyncedMainCollectionOptions
    | LiteDocsSyncedMainCollectionOptionsWithCompare<TParent, TMain, FieldPath>,
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
    const mainCollectionRef = db.collection(mainCollectionPath) as CollectionReference<TMain>;
    const mainDocSnapshots = (await mainCollectionRef.get()).docs;
    let docCount = 0;

    const callback = async (docSnapshot: QueryDocumentSnapshot<TParent>) => {
      docCount++;

      const fieldValue = docSnapshot.get(fieldPath) as TParent[FieldPath];

      function hasCompare(
        o: typeof options,
      ): o is LiteDocsSyncedMainCollectionOptionsWithCompare<TParent, TMain, FieldPath> {
        return (
          !!o &&
          !!(o as LiteDocsSyncedMainCollectionOptionsWithCompare<TParent, TMain, FieldPath>).compare
        );
      }

      if (fieldValue) {
        if (hasCompare(options)) {
          options.compare(docSnapshot, mainDocSnapshots, fieldValue, errors);
        } else {
          const fieldValueWithId = fieldValue as typeof fieldValue & { id: string };
          const mainDocSnapshot = mainDocSnapshots.find(
            (value) => value.id === fieldValueWithId.id,
          );

          if (mainDocSnapshot) {
            compareFieldNames.forEach((compareFieldName) => {
              if (fieldValue[compareFieldName] !== mainDocSnapshot.data()[compareFieldName]) {
                errors.push(
                  `\`${docSnapshot.ref.path}.${fieldPath}.id\` '\`${fieldValueWithId.id}\`' has different \`${compareFieldName}\` from related document in \`${mainCollectionPath}\`.`,
                );
              }
            });
          } else {
            errors.push(
              `\`${docSnapshot.ref.path}.${fieldPath}.id\` '\`${fieldValueWithId.id}\`' does not match any document in \`${mainCollectionPath}\`.`,
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
